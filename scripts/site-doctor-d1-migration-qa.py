#!/usr/bin/env python3
"""Validate the real SQLite migration underlying the Cloudflare D1 one-shot pilot.

Entirely local, temporary database files. Does NOT connect to Cloudflare,
Google PageSpeed, CRM, or any external service.
"""
import concurrent.futures
import pathlib
import sqlite3
import tempfile
import threading

ROOT = pathlib.Path(__file__).resolve().parents[1]
MIGRATION = ROOT / "migrations/site-doctor-pilot/0001_one_shot.sql"
CLAIM = "INSERT OR IGNORE INTO site_doctor_pilot_claims (id, claimed_at) VALUES (1, datetime('now'))"


def connect(path):
    conn = sqlite3.connect(path, timeout=30, isolation_level=None)
    conn.execute("PRAGMA busy_timeout = 30000")
    return conn


def inspect_schema(conn):
    tables = conn.execute(
        "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name = 'site_doctor_pilot_claims'"
    ).fetchall()
    assert len(tables) == 1, "Pilot table was not created"
    definition = tables[0][1].lower()
    assert "primary key" in definition and "check (id = 1)" in definition, "Missing singleton constraint"

    with conn:
        try:
            conn.execute(
                "INSERT INTO site_doctor_pilot_claims (id, claimed_at) VALUES (2, '2026-10-17')"
            )
        except sqlite3.IntegrityError:
            pass
        else:
            raise AssertionError("D1 schema accepted an invalid second identifier")
    assert conn.execute("SELECT count(*) FROM site_doctor_pilot_claims").fetchone()[0] == 0


def run_parallel_claims(db_path, total=12):
    gate = threading.Barrier(total)

    def attempt(_):
        conn = connect(db_path)
        try:
            gate.wait(timeout=15)
            cursor = conn.execute(CLAIM)
            # SQLite changes() is the same source of truth behind D1 meta.changes.
            return cursor.rowcount
        finally:
            conn.close()

    with concurrent.futures.ThreadPoolExecutor(max_workers=total) as pool:
        claims = list(pool.map(attempt, range(total)))

    assert claims.count(1) == 1, f"Expected one winning claim, got {claims}"
    assert claims.count(0) == total - 1, f"Unexpected replay results: {claims}"


def main():
    migration = MIGRATION.read_text(encoding="utf-8")
    assert "CREATE TABLE IF NOT EXISTS site_doctor_pilot_claims" in migration
    assert "PRIMARY KEY CHECK (id = 1)" in migration
    assert "DROP TABLE" not in migration.upper(), "Migration must not reset usage"

    with tempfile.TemporaryDirectory(prefix="site-doctor-d1-qa-") as tmp:
        db_path = pathlib.Path(tmp) / "single-use.sqlite"
        conn = connect(db_path)
        conn.executescript(migration)
        inspect_schema(conn)
        conn.close()

        run_parallel_claims(db_path)
        conn = connect(db_path)
        rows = conn.execute(
            "SELECT id, claimed_at FROM site_doctor_pilot_claims ORDER BY id"
        ).fetchall()
        assert len(rows) == 1 and rows[0][0] == 1 and rows[0][1]
        assert conn.execute(CLAIM).rowcount == 0, "Replay after reconnect was accepted"
        conn.close()

        # Redeploy/restart doesn't reset the claim: migration is idempotent.
        conn = connect(db_path)
        conn.executescript(migration)
        assert conn.execute(CLAIM).rowcount == 0, "Migration unexpectedly rearmed the pilot"
        assert conn.execute("SELECT count(*) FROM site_doctor_pilot_claims").fetchone()[0] == 1
        conn.close()

    print(
        "D1 SQL migration QA PASS: SQLite schema, singleton CHECK, "
        "12 parallel inserts -> one winner, replay blocked after reconnect and migration rerun."
    )


if __name__ == "__main__":
    main()
