import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

// Typy
type TabType = 'html' | 'css' | 'js';
type DeviceType = 'desktop' | 'tablet' | 'mobile';
type LogType = 'log' | 'error' | 'warn' | 'info' | 'clear';

interface Template {
  id: string;
  name: { pl: string; en: string };
  icon: string;
  description: { pl: string; en: string };
  html: string;
  css: string;
  js: string;
}

interface ConsoleLog {
  id: number;
  type: LogType;
  message: string;
  timestamp: Date;
}

// Szablony
const templates: Template[] = [
  {
    id: 'starter',
    name: { pl: 'Starter', en: 'Starter' },
    icon: '🚀',
    description: { pl: 'Podstawowy przykład', en: 'Basic example' },
    html: `<div class="container">
  <h1 class="title">Witaj w CodeFix.IT!</h1>
  <p class="subtitle">Edytuj kod i zobacz zmiany na żywo</p>
  
  <div class="card">
    <div class="card-icon">🚀</div>
    <h2>Twój pierwszy projekt</h2>
    <p>Zmień ten kod, aby zobaczyć jak działa playground.</p>
    <button class="btn" onclick="handleClick()">
      Kliknij mnie!
    </button>
  </div>
  
  <div class="features">
    <div class="feature">
      <span class="feature-icon">⚡</span>
      <span>Szybki podgląd</span>
    </div>
    <div class="feature">
      <span class="feature-icon">🎨</span>
      <span>Live CSS</span>
    </div>
    <div class="feature">
      <span class="feature-icon">📱</span>
      <span>Responsywność</span>
    </div>
  </div>
</div>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  max-width: 500px;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
  animation: fadeInUp 0.6s ease-out;
}

.subtitle {
  color: #888;
  font-size: 1.1rem;
  margin-bottom: 30px;
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
}

.card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 40px;
  backdrop-filter: blur(10px);
  animation: fadeInUp 0.6s ease-out 0.2s backwards;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  animation: bounce 2s infinite;
}

.card h2 {
  color: #fff;
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.card p {
  color: #aaa;
  margin-bottom: 25px;
  line-height: 1.6;
}

.btn {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  border: none;
  padding: 14px 35px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
}

.btn:active {
  transform: translateY(0) scale(0.98);
}

.features {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  flex-wrap: wrap;
  animation: fadeInUp 0.6s ease-out 0.3s backwards;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255,255,255,0.05);
  border-radius: 30px;
  color: #ccc;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.feature:hover {
  background: rgba(220, 38, 38, 0.2);
  color: #fff;
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 1.1rem;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}`,
    js: `let clickCount = 0;

function handleClick() {
  clickCount++;
  
  const btn = document.querySelector('.btn');
  const messages = [
    '🎉 Świetnie!',
    '🚀 Super!',
    '⚡ Niesamowite!',
    '🔥 Wow!',
    '✨ Fantastycznie!'
  ];
  
  const randomMsg = messages[Math.floor(Math.random() * messages.length)];
  btn.textContent = randomMsg;
  
  console.log('Kliknięcie #' + clickCount);
  
  // Efekt ripple
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => {
    btn.style.transform = '';
  }, 150);
  
  // Reset tekstu po chwili
  setTimeout(() => {
    btn.textContent = 'Kliknij mnie!';
  }, 1500);
}

// Log startowy
console.log('🚀 CodeFix.IT Playground załadowany!');
console.info('ℹ️ Edytuj kod aby zobaczyć zmiany');`
  },
  {
    id: 'buttons',
    name: { pl: 'Przyciski', en: 'Buttons' },
    icon: '🔘',
    description: { pl: 'Kolekcja przycisków', en: 'Button collection' },
    html: `<div class="container">
  <h1>Kolekcja Przycisków</h1>
  <p class="subtitle">Różne style i efekty</p>
  
  <div class="button-group">
    <h3>Podstawowe</h3>
    <div class="buttons">
      <button class="btn btn-primary">Primary</button>
      <button class="btn btn-secondary">Secondary</button>
      <button class="btn btn-outline">Outline</button>
      <button class="btn btn-ghost">Ghost</button>
    </div>
  </div>
  
  <div class="button-group">
    <h3>Z efektami</h3>
    <div class="buttons">
      <button class="btn btn-glow">Glow Effect</button>
      <button class="btn btn-gradient">Gradient</button>
      <button class="btn btn-3d">3D Button</button>
      <button class="btn btn-ripple" onclick="createRipple(event)">Ripple</button>
    </div>
  </div>
  
  <div class="button-group">
    <h3>Z ikonami</h3>
    <div class="buttons">
      <button class="btn btn-icon"><span>🚀</span> Uruchom</button>
      <button class="btn btn-icon"><span>💾</span> Zapisz</button>
      <button class="btn btn-icon"><span>📤</span> Wyślij</button>
      <button class="btn btn-loading" onclick="startLoading(this)">
        <span class="loader"></span>
        <span class="text">Załaduj</span>
      </button>
    </div>
  </div>
</div>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
  min-height: 100vh;
  padding: 40px 20px;
  color: white;
}

.container {
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #fff, #dc2626);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
}

.button-group {
  margin-bottom: 35px;
}

.button-group h3 {
  color: #888;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 15px;
  padding-left: 5px;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: #dc2626;
  color: white;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.btn-primary:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.4);
}

.btn-secondary {
  background: #27272a;
  color: white;
  border: 1px solid #3f3f46;
}

.btn-secondary:hover {
  background: #3f3f46;
  border-color: #52525b;
}

.btn-outline {
  background: transparent;
  color: #dc2626;
  border: 2px solid #dc2626;
}

.btn-outline:hover {
  background: #dc2626;
  color: white;
}

.btn-ghost {
  background: transparent;
  color: #888;
}

.btn-ghost:hover {
  background: rgba(255,255,255,0.1);
  color: white;
}

.btn-glow {
  background: #dc2626;
  color: white;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { box-shadow: 0 0 10px #dc2626, 0 0 20px #dc2626; }
  to { box-shadow: 0 0 20px #dc2626, 0 0 40px #dc2626, 0 0 60px #dc2626; }
}

.btn-gradient {
  background: linear-gradient(135deg, #dc2626, #f97316, #dc2626);
  background-size: 200% 200%;
  color: white;
  animation: gradientMove 3s ease infinite;
}

@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.btn-3d {
  background: #dc2626;
  color: white;
  border-bottom: 4px solid #991b1b;
  transform: translateY(0);
}

.btn-3d:hover {
  transform: translateY(-2px);
  border-bottom-width: 6px;
}

.btn-3d:active {
  transform: translateY(2px);
  border-bottom-width: 2px;
}

.btn-ripple {
  background: #dc2626;
  color: white;
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  transform: scale(0);
  animation: rippleEffect 0.6s linear;
  pointer-events: none;
}

@keyframes rippleEffect {
  to { transform: scale(4); opacity: 0; }
}

.btn-icon {
  background: #27272a;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon:hover {
  background: #3f3f46;
}

.btn-icon span {
  font-size: 1.1rem;
}

.btn-loading {
  background: #dc2626;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.btn-loading .loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  display: none;
  animation: spin 0.8s linear infinite;
}

.btn-loading.loading .loader {
  display: block;
}

.btn-loading.loading .text {
  display: none;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}`,
    js: `function createRipple(event) {
  const btn = event.currentTarget;
  const ripple = document.createElement('span');
  
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');
  
  btn.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
  
  console.log('🌊 Ripple effect created!');
}

function startLoading(btn) {
  btn.classList.add('loading');
  console.log('⏳ Loading started...');
  
  setTimeout(() => {
    btn.classList.remove('loading');
    console.log('✅ Loading complete!');
  }, 2000);
}

console.log('🔘 Buttons loaded');
console.info('Click on buttons to see effects');`
  },
  {
    id: 'card',
    name: { pl: 'Karta', en: 'Card' },
    icon: '🃏',
    description: { pl: 'Karta produktu', en: 'Product card' },
    html: `<div class="container">
  <div class="card">
    <div class="card-badge">NEW</div>
    <div class="card-image">
      <div class="placeholder-image">
        <span>🎨</span>
      </div>
      <div class="card-overlay">
        <button class="quick-view" onclick="quickView()">Quick View</button>
      </div>
    </div>
    
    <div class="card-content">
      <div class="card-category">Premium Collection</div>
      <h2 class="card-title">Nowoczesny Design System</h2>
      <p class="card-description">
        Kompleksowy zestaw komponentów UI gotowych do użycia w Twoim projekcie.
      </p>
      
      <div class="card-meta">
        <div class="rating">
          <span class="stars">★★★★★</span>
          <span class="count">(128 reviews)</span>
        </div>
        <div class="price">
          <span class="old-price">299 PLN</span>
          <span class="new-price">199 PLN</span>
        </div>
      </div>
      
      <div class="card-actions">
        <button class="btn-cart" onclick="addToCart()">
          <span>🛒</span> Dodaj do koszyka
        </button>
        <button class="btn-wishlist" onclick="toggleWishlist(this)">
          <span>♡</span>
        </button>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="footer-item">
        <span>📦</span> Darmowa dostawa
      </div>
      <div class="footer-item">
        <span>↩️</span> 30 dni zwrotu
      </div>
    </div>
  </div>
</div>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  perspective: 1000px;
}

.card {
  width: 350px;
  background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}

.card:hover {
  transform: translateY(-10px) rotateX(5deg);
  box-shadow: 0 35px 60px -15px rgba(0,0,0,0.6);
  border-color: rgba(220, 38, 38, 0.3);
}

.card-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  z-index: 10;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
}

.card-image {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #27272a, #18181b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  transition: transform 0.5s ease;
}

.card:hover .placeholder-image {
  transform: scale(1.1);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover .card-overlay {
  opacity: 1;
}

.quick-view {
  background: white;
  color: #0a0a0a;
  border: none;
  padding: 12px 28px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.card:hover .quick-view {
  transform: translateY(0);
}

.quick-view:hover {
  background: #dc2626;
  color: white;
}

.card-content {
  padding: 25px;
}

.card-category {
  color: #dc2626;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.card-title {
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 1.3;
}

.card-description {
  color: #888;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 20px;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars {
  color: #fbbf24;
  font-size: 0.9rem;
}

.count {
  color: #666;
  font-size: 0.8rem;
}

.price {
  text-align: right;
}

.old-price {
  color: #666;
  text-decoration: line-through;
  font-size: 0.85rem;
  display: block;
}

.new-price {
  color: #dc2626;
  font-size: 1.4rem;
  font-weight: 700;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.btn-cart {
  flex: 1;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-cart:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
}

.btn-wishlist {
  width: 50px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #888;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-wishlist:hover,
.btn-wishlist.active {
  background: rgba(220, 38, 38, 0.2);
  border-color: #dc2626;
  color: #dc2626;
}

.btn-wishlist.active span {
  display: inline-block;
  animation: heartBeat 0.6s ease;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

.card-footer {
  display: flex;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.footer-item {
  flex: 1;
  padding: 15px;
  text-align: center;
  color: #666;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.footer-item:first-child {
  border-right: 1px solid rgba(255,255,255,0.05);
}

.footer-item:hover {
  background: rgba(255,255,255,0.02);
  color: #aaa;
}`,
    js: `function quickView() {
  console.log('👁️ Quick View opened');
  alert('Quick View Modal - tutaj możesz pokazać galerię zdjęć');
}

function addToCart() {
  const btn = document.querySelector('.btn-cart');
  const originalText = btn.innerHTML;
  
  btn.innerHTML = '<span>✓</span> Dodano!';
  btn.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
  
  console.log('🛒 Product added to cart!');
  
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.style.background = '';
  }, 2000);
}

function toggleWishlist(btn) {
  btn.classList.toggle('active');
  const isActive = btn.classList.contains('active');
  btn.querySelector('span').textContent = isActive ? '♥' : '♡';
  
  console.log(isActive ? '❤️ Added to wishlist' : '💔 Removed from wishlist');
}

console.log('🃏 Card component loaded');`
  },
  {
    id: 'form',
    name: { pl: 'Formularz', en: 'Form' },
    icon: '📝',
    description: { pl: 'Formularz kontaktowy', en: 'Contact form' },
    html: `<div class="container">
  <div class="form-card">
    <div class="form-header">
      <div class="icon">✉️</div>
      <h1>Skontaktuj się</h1>
      <p>Odpowiemy w ciągu 24 godzin</p>
    </div>
    
    <form id="contactForm" onsubmit="handleSubmit(event)">
      <div class="form-row">
        <div class="form-group">
          <label for="name">Imię</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input type="text" id="name" placeholder="Jan Kowalski" required>
          </div>
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <span class="input-icon">📧</span>
            <input type="email" id="email" placeholder="jan@example.com" required>
          </div>
        </div>
      </div>
      
      <div class="form-group">
        <label for="subject">Temat</label>
        <div class="input-wrapper">
          <span class="input-icon">📋</span>
          <select id="subject" required>
            <option value="">Wybierz temat...</option>
            <option value="project">Nowy projekt</option>
            <option value="quote">Wycena</option>
            <option value="support">Wsparcie</option>
            <option value="other">Inne</option>
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label for="message">Wiadomość</label>
        <div class="input-wrapper textarea-wrapper">
          <textarea id="message" rows="4" placeholder="Opisz swój projekt..." required></textarea>
          <span class="char-count">0/500</span>
        </div>
      </div>
      
      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" id="terms" required>
          <span class="checkmark"></span>
          <span>Akceptuję <a href="#">regulamin</a> i <a href="#">politykę prywatności</a></span>
        </label>
      </div>
      
      <button type="submit" class="submit-btn">
        <span class="btn-text">Wyślij wiadomość</span>
        <span class="btn-icon">→</span>
      </button>
    </form>
    
    <div class="form-footer">
      <p>Lub napisz bezpośrednio:</p>
      <a href="mailto:hello@codefix.it">wwwcodefixit@gmail.com</a>
    </div>
  </div>
</div>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #0a0a0a 0%, #171717 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.form-card {
  width: 100%;
  max-width: 500px;
  background: linear-gradient(145deg, rgba(30,30,30,0.9), rgba(15,15,15,0.9));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 28px;
  padding: 40px;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}

.form-header {
  text-align: center;
  margin-bottom: 35px;
}

.form-header .icon {
  font-size: 3rem;
  margin-bottom: 15px;
  display: block;
}

.form-header h1 {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.form-header p {
  color: #888;
  font-size: 0.95rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #ccc;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 15px;
  font-size: 1rem;
  z-index: 1;
}

input, select, textarea {
  width: 100%;
  padding: 14px 15px 14px 45px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: white;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s ease;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #dc2626;
  background: rgba(220, 38, 38, 0.05);
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
}

input::placeholder, textarea::placeholder {
  color: #555;
}

select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
}

select option {
  background: #1a1a1a;
  color: white;
}

.textarea-wrapper {
  flex-direction: column;
  align-items: stretch;
}

textarea {
  padding: 15px;
  resize: vertical;
  min-height: 100px;
}

.char-count {
  position: absolute;
  bottom: 10px;
  right: 15px;
  font-size: 0.75rem;
  color: #555;
}

.checkbox-group {
  margin-bottom: 25px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #888;
  line-height: 1.5;
}

.checkbox-label input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  min-width: 20px;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.checkbox-label input:checked + .checkmark {
  background: #dc2626;
  border-color: #dc2626;
}

.checkbox-label input:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.checkbox-label a {
  color: #dc2626;
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn .btn-icon {
  transition: transform 0.3s ease;
}

.submit-btn:hover .btn-icon {
  transform: translateX(5px);
}

.submit-btn.loading {
  pointer-events: none;
  opacity: 0.8;
}

.submit-btn.success {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.form-footer {
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid rgba(255,255,255,0.05);
  text-align: center;
}

.form-footer p {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.form-footer a {
  color: #dc2626;
  text-decoration: none;
  font-weight: 500;
}

.form-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 500px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-card {
    padding: 25px;
  }
}`,
    js: `// Character counter
const textarea = document.getElementById('message');
const charCount = document.querySelector('.char-count');

textarea.addEventListener('input', () => {
  const count = textarea.value.length;
  charCount.textContent = count + '/500';
  
  if (count > 450) {
    charCount.style.color = '#dc2626';
  } else {
    charCount.style.color = '#555';
  }
  
  if (count > 500) {
    textarea.value = textarea.value.substring(0, 500);
  }
});

// Form validation and submission
function handleSubmit(e) {
  e.preventDefault();
  
  const btn = document.querySelector('.submit-btn');
  const form = document.getElementById('contactForm');
  
  // Get form data
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    subject: document.getElementById('subject').value,
    message: document.getElementById('message').value
  };
  
  // Loading state
  btn.classList.add('loading');
  btn.innerHTML = '<span class="btn-text">Wysyłanie...</span>';
  
  console.log('📤 Sending form data:', formData);
  
  // Simulate API call
  setTimeout(() => {
    btn.classList.remove('loading');
    btn.classList.add('success');
    btn.innerHTML = '<span class="btn-text">✓ Wysłano!</span>';
    
    console.log('✅ Form submitted successfully!');
    
    // Reset after 3 seconds
    setTimeout(() => {
      form.reset();
      charCount.textContent = '0/500';
      btn.classList.remove('success');
      btn.innerHTML = '<span class="btn-text">Wyślij wiadomość</span><span class="btn-icon">→</span>';
    }, 3000);
  }, 2000);
}

// Focus animations
document.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('focus', () => {
    field.parentElement.style.transform = 'scale(1.02)';
  });
  
  field.addEventListener('blur', () => {
    field.parentElement.style.transform = '';
  });
});

console.log('📝 Form component loaded');
console.info('Fill and submit the form to test');`
  },
  {
    id: 'animations',
    name: { pl: 'Animacje', en: 'Animations' },
    icon: '✨',
    description: { pl: 'Showcase animacji CSS', en: 'CSS animations showcase' },
    html: `<div class="container">
  <h1>Animacje CSS</h1>
  <p class="subtitle">Kliknij na elementy, aby je zrestartować</p>
  
  <div class="animations-grid">
    <div class="anim-card" onclick="restartAnimation(this)">
      <div class="anim-demo pulse-demo">
        <div class="pulse-circle"></div>
      </div>
      <h3>Pulse</h3>
      <code>animation: pulse 2s infinite</code>
    </div>
    
    <div class="anim-card" onclick="restartAnimation(this)">
      <div class="anim-demo bounce-demo">
        <div class="bounce-ball"></div>
      </div>
      <h3>Bounce</h3>
      <code>animation: bounce 1s infinite</code>
    </div>
    
    <div class="anim-card" onclick="restartAnimation(this)">
      <div class="anim-demo shake-demo">
        <div class="shake-box">🔔</div>
      </div>
      <h3>Shake</h3>
      <code>animation: shake 0.5s</code>
    </div>
    
    <div class="anim-card" onclick="restartAnimation(this)">
      <div class="anim-demo rotate-demo">
        <div class="rotate-square"></div>
      </div>
      <h3>Rotate</h3>
      <code>animation: rotate 2s linear infinite</code>
    </div>
    
    <div class="anim-card" onclick="restartAnimation(this)">
      <div class="anim-demo glow-demo">
        <div class="glow-orb"></div>
      </div>
      <h3>Glow</h3>
      <code>animation: glow 2s alternate infinite</code>
    </div>
    
    <div class="anim-card" onclick="restartAnimation(this)">
      <div class="anim-demo morph-demo">
        <div class="morph-shape"></div>
      </div>
      <h3>Morph</h3>
      <code>animation: morph 3s infinite</code>
    </div>
    
    <div class="anim-card" onclick="restartAnimation(this)">
      <div class="anim-demo wave-demo">
        <div class="wave-bars">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
      <h3>Wave</h3>
      <code>animation: wave 1s ease-in-out infinite</code>
    </div>
    
    <div class="anim-card" onclick="restartAnimation(this)">
      <div class="anim-demo flip-demo">
        <div class="flip-card">
          <div class="flip-front">A</div>
          <div class="flip-back">B</div>
        </div>
      </div>
      <h3>Flip</h3>
      <code>transform: rotateY(180deg)</code>
    </div>
    
    <div class="anim-card" onclick="restartAnimation(this)">
      <div class="anim-demo typewriter-demo">
        <div class="typewriter">Hello World!</div>
      </div>
      <h3>Typewriter</h3>
      <code>animation: typing + blink</code>
    </div>
  </div>
</div>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%);
  min-height: 100vh;
  padding: 40px 20px;
  color: white;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #fff, #dc2626);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
}

.animations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.anim-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.anim-card:hover {
  border-color: rgba(220, 38, 38, 0.3);
  transform: translateY(-5px);
  box-shadow: 0 15px 40px -10px rgba(220, 38, 38, 0.2);
}

.anim-demo {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.anim-card h3 {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: #fff;
}

.anim-card code {
  font-size: 0.75rem;
  color: #888;
  background: rgba(255,255,255,0.05);
  padding: 5px 10px;
  border-radius: 6px;
  display: inline-block;
}

/* Pulse */
.pulse-circle {
  width: 50px;
  height: 50px;
  background: #dc2626;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}

/* Bounce */
.bounce-ball {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #dc2626, #f97316);
  border-radius: 50%;
  animation: bounce 0.6s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}

/* Shake */
.shake-box {
  font-size: 2.5rem;
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0) rotate(0); }
  25% { transform: translateX(-5px) rotate(-5deg); }
  75% { transform: translateX(5px) rotate(5deg); }
}

/* Rotate */
.rotate-square {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #dc2626, #7c3aed);
  border-radius: 8px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Glow */
.glow-orb {
  width: 50px;
  height: 50px;
  background: #dc2626;
  border-radius: 50%;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { box-shadow: 0 0 10px #dc2626, 0 0 20px #dc2626; }
  to { box-shadow: 0 0 30px #dc2626, 0 0 60px #dc2626, 0 0 90px #dc2626; }
}

/* Morph */
.morph-shape {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #dc2626, #f97316);
  animation: morph 3s ease-in-out infinite;
}

@keyframes morph {
  0%, 100% { border-radius: 50%; transform: rotate(0); }
  25% { border-radius: 20% 80% 20% 80%; transform: rotate(90deg); }
  50% { border-radius: 50%; transform: rotate(180deg); }
  75% { border-radius: 80% 20% 80% 20%; transform: rotate(270deg); }
}

/* Wave */
.wave-bars {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 50px;
}

.wave-bars span {
  width: 8px;
  background: #dc2626;
  border-radius: 4px;
  animation: wave 1s ease-in-out infinite;
}

.wave-bars span:nth-child(1) { animation-delay: 0s; }
.wave-bars span:nth-child(2) { animation-delay: 0.1s; }
.wave-bars span:nth-child(3) { animation-delay: 0.2s; }
.wave-bars span:nth-child(4) { animation-delay: 0.3s; }
.wave-bars span:nth-child(5) { animation-delay: 0.4s; }

@keyframes wave {
  0%, 100% { height: 10px; }
  50% { height: 50px; }
}

/* Flip */
.flip-card {
  width: 60px;
  height: 60px;
  position: relative;
  transform-style: preserve-3d;
  animation: flip 3s ease-in-out infinite;
}

.flip-front, .flip-back {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 12px;
  backface-visibility: hidden;
}

.flip-front {
  background: #dc2626;
}

.flip-back {
  background: #7c3aed;
  transform: rotateY(180deg);
}

@keyframes flip {
  0%, 45% { transform: rotateY(0); }
  50%, 95% { transform: rotateY(180deg); }
  100% { transform: rotateY(360deg); }
}

/* Typewriter */
.typewriter {
  font-family: monospace;
  font-size: 1.2rem;
  overflow: hidden;
  border-right: 2px solid #dc2626;
  white-space: nowrap;
  animation: typing 2s steps(12) infinite, blink 0.5s step-end infinite;
  width: 12ch;
}

@keyframes typing {
  0%, 100% { width: 0; }
  50%, 90% { width: 12ch; }
}

@keyframes blink {
  50% { border-color: transparent; }
}`,
    js: `function restartAnimation(card) {
  const demo = card.querySelector('.anim-demo > *');
  
  // Clone and replace to restart animation
  const clone = demo.cloneNode(true);
  demo.parentNode.replaceChild(clone, demo);
  
  // Log animation name
  const animName = card.querySelector('h3').textContent;
  console.log('🔄 Restarted: ' + animName);
}

// Log on load
console.log('✨ Animations showcase loaded');
console.info('Click on any card to restart its animation');

// Count animations
const cards = document.querySelectorAll('.anim-card');
console.log('📊 Total animations: ' + cards.length);`
  },
  {
    id: 'responsive',
    name: { pl: 'Responsive', en: 'Responsive' },
    icon: '📱',
    description: { pl: 'Responsywny layout', en: 'Responsive layout' },
    html: `<div class="app">
  <header class="header">
    <div class="logo">
      <span class="logo-icon">⚡</span>
      <span class="logo-text">Brand</span>
    </div>
    
    <nav class="nav desktop-nav">
      <a href="#" class="nav-link active">Home</a>
      <a href="#" class="nav-link">Features</a>
      <a href="#" class="nav-link">Pricing</a>
      <a href="#" class="nav-link">Contact</a>
    </nav>
    
    <button class="menu-btn" onclick="toggleMenu()">
      <span></span>
      <span></span>
      <span></span>
    </button>
  </header>
  
  <nav class="mobile-nav" id="mobileNav">
    <a href="#" class="nav-link active">Home</a>
    <a href="#" class="nav-link">Features</a>
    <a href="#" class="nav-link">Pricing</a>
    <a href="#" class="nav-link">Contact</a>
  </nav>
  
  <main class="main">
    <section class="hero">
      <h1>Responsive Design</h1>
      <p>Zmień rozmiar okna, aby zobaczyć jak layout się adaptuje</p>
      <div class="hero-buttons">
        <button class="btn btn-primary">Get Started</button>
        <button class="btn btn-outline">Learn More</button>
      </div>
    </section>
    
    <section class="features">
      <div class="feature-card">
        <span class="feature-icon">📱</span>
        <h3>Mobile First</h3>
        <p>Projektowany od urządzeń mobilnych</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">💻</span>
        <h3>Fluid Layout</h3>
        <p>Płynne przejścia między breakpointami</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">🎨</span>
        <h3>Flexible Grid</h3>
        <p>Elastyczny system siatki</p>
      </div>
    </section>
    
    <section class="stats">
      <div class="stat">
        <span class="stat-number">100%</span>
        <span class="stat-label">Responsive</span>
      </div>
      <div class="stat">
        <span class="stat-number">3</span>
        <span class="stat-label">Breakpoints</span>
      </div>
      <div class="stat">
        <span class="stat-number">∞</span>
        <span class="stat-label">Possibilities</span>
      </div>
    </section>
  </main>
  
  <footer class="footer">
    <p>© 2024 Brand. Resize to see responsive magic!</p>
  </footer>
</div>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: #0a0a0a;
  color: white;
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: rgba(10, 10, 10, 0.95);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.3rem;
  font-weight: 700;
}

.desktop-nav {
  display: none;
  gap: 30px;
}

.nav-link {
  color: #888;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: #dc2626;
}

.menu-btn {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.menu-btn span {
  width: 25px;
  height: 2px;
  background: white;
  transition: all 0.3s;
}

.menu-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.menu-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* Mobile Nav */
.mobile-nav {
  display: none;
  flex-direction: column;
  background: #111;
  padding: 20px;
  gap: 15px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.mobile-nav.active {
  display: flex;
}

/* Main */
.main {
  flex: 1;
  padding: 30px 20px;
}

/* Hero */
.hero {
  text-align: center;
  padding: 40px 0;
  margin-bottom: 40px;
}

.hero h1 {
  font-size: 2rem;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #fff, #dc2626);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero p {
  color: #888;
  margin-bottom: 25px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
  margin: 0 auto;
}

.btn {
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #dc2626;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #b91c1c;
}

.btn-outline {
  background: transparent;
  color: white;
  border: 1px solid rgba(255,255,255,0.2);
}

.btn-outline:hover {
  border-color: #dc2626;
  color: #dc2626;
}

/* Features */
.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 25px;
  text-align: center;
  transition: all 0.3s;
}

.feature-card:hover {
  border-color: rgba(220, 38, 38, 0.3);
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.feature-card p {
  color: #888;
  font-size: 0.9rem;
}

/* Stats */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  text-align: center;
}

.stat {
  padding: 20px 10px;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 12px;
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: #dc2626;
}

.stat-label {
  color: #888;
  font-size: 0.8rem;
}

/* Footer */
.footer {
  padding: 20px;
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.05);
  color: #666;
  font-size: 0.85rem;
}

/* Tablet Breakpoint */
@media (min-width: 640px) {
  .header {
    padding: 20px 40px;
  }
  
  .main {
    padding: 40px;
  }
  
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .hero-buttons {
    flex-direction: row;
    max-width: none;
    justify-content: center;
  }
  
  .features {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .stat-number {
    font-size: 2.5rem;
  }
}

/* Desktop Breakpoint */
@media (min-width: 1024px) {
  .desktop-nav {
    display: flex;
  }
  
  .menu-btn {
    display: none;
  }
  
  .mobile-nav {
    display: none !important;
  }
  
  .header {
    padding: 20px 60px;
  }
  
  .main {
    padding: 60px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  
  .hero {
    padding: 80px 0;
  }
  
  .hero h1 {
    font-size: 3.5rem;
  }
  
  .hero p {
    font-size: 1.1rem;
    max-width: 500px;
  }
  
  .features {
    gap: 30px;
  }
  
  .feature-card {
    padding: 35px;
  }
}`,
    js: `function toggleMenu() {
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('mobileNav');
  
  btn.classList.toggle('active');
  nav.classList.toggle('active');
  
  const isOpen = nav.classList.contains('active');
  console.log(isOpen ? '📱 Menu opened' : '📱 Menu closed');
}

// Log current breakpoint
function logBreakpoint() {
  const width = window.innerWidth;
  let bp = 'mobile';
  
  if (width >= 1024) bp = 'desktop';
  else if (width >= 640) bp = 'tablet';
  
  console.log('📐 Breakpoint: ' + bp + ' (' + width + 'px)');
}

// Initial log
logBreakpoint();

// Log on resize (throttled)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(logBreakpoint, 200);
});

console.log('📱 Responsive layout loaded');
console.info('Resize the preview to see breakpoints change');`
  }
];

export function CodePlayground() {
  const { language } = useLanguage();
  const t = (pl: string, en: string) => language === 'pl' ? pl : en;
  
  // State
  const [activeTemplate, setActiveTemplate] = useState(templates[0]);
  const [activeTab, setActiveTab] = useState<TabType>('html');
  const [html, setHtml] = useState(templates[0].html);
  const [css, setCss] = useState(templates[0].css);
  const [js, setJs] = useState(templates[0].js);
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [showConsole, setShowConsole] = useState(true);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [autoRun, setAutoRun] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState('');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const logIdRef = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTemplates(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate output
  const generateOutput = useCallback(() => {
    const consoleScript = `
      <script>
        (function() {
          const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
          };
          
          function sendToParent(type, args) {
            try {
              window.parent.postMessage({
                type: 'console',
                logType: type,
                message: Array.from(args).map(arg => {
                  if (typeof arg === 'object') return JSON.stringify(arg, null, 2);
                  return String(arg);
                }).join(' ')
              }, '*');
            } catch(e) {}
          }
          
          console.log = function() { sendToParent('log', arguments); originalConsole.log.apply(console, arguments); };
          console.error = function() { sendToParent('error', arguments); originalConsole.error.apply(console, arguments); };
          console.warn = function() { sendToParent('warn', arguments); originalConsole.warn.apply(console, arguments); };
          console.info = function() { sendToParent('info', arguments); originalConsole.info.apply(console, arguments); };
          
          window.onerror = function(msg, url, line) {
            sendToParent('error', ['Error: ' + msg + ' (line ' + line + ')']);
            return false;
          };
        })();
      </script>
    `;

    return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>${css}</style>
  ${consoleScript}
</head>
<body>
  ${html}
  <script>${js}</script>
</body>
</html>`;
  }, [html, css, js]);

  // Update output with debounce
  useEffect(() => {
    if (!autoRun) return;
    const timer = setTimeout(() => {
      setOutput(generateOutput());
    }, 500);
    return () => clearTimeout(timer);
  }, [html, css, js, autoRun, generateOutput]);

  // Listen for console messages
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'console') {
        const newLog: ConsoleLog = {
          id: ++logIdRef.current,
          type: e.data.logType,
          message: e.data.message,
          timestamp: new Date()
        };
        setConsoleLogs(prev => [...prev.slice(-99), newLog]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Handle fullscreen ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  // Block body scroll in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isFullscreen]);

  // Handlers
  const handleTemplateChange = (template: Template) => {
    setActiveTemplate(template);
    setHtml(template.html);
    setCss(template.css);
    setJs(template.js);
    setShowTemplates(false);
    setConsoleLogs([]);
    if (!autoRun) {
      setOutput(generateOutput());
    }
  };

  const handleRun = () => {
    setConsoleLogs([]);
    setOutput(generateOutput());
  };

  const handleCopy = () => {
    const code = activeTab === 'html' ? html : activeTab === 'css' ? css : js;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateOutput()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTemplate.id}-codefix.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setHtml(activeTemplate.html);
    setCss(activeTemplate.css);
    setJs(activeTemplate.js);
    setConsoleLogs([]);
  };

  const getCode = () => activeTab === 'html' ? html : activeTab === 'css' ? css : js;
  const setCode = (value: string) => {
    if (activeTab === 'html') setHtml(value);
    else if (activeTab === 'css') setCss(value);
    else setJs(value);
  };

  const getLineNumbers = () => {
    const lines = getCode().split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  };

  const getDeviceWidth = () => {
    switch (device) {
      case 'tablet': return '768px';
      case 'mobile': return '375px';
      default: return '100%';
    }
  };

  // Tab config
  const tabs: { id: TabType; label: string; icon: string; color: string }[] = [
    { id: 'html', label: 'HTML', icon: '🏷️', color: '#f97316' },
    { id: 'css', label: 'CSS', icon: '🎨', color: '#3b82f6' },
    { id: 'js', label: 'JavaScript', icon: '⚡', color: '#eab308' }
  ];

  // Editor component
  const renderEditor = (isFs: boolean = false) => (
    <div className={`flex flex-col ${isFs ? 'h-full' : 'h-[600px]'} bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800/50`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          {/* Window controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => isFs ? setIsFullscreen(false) : null}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors"
            />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          
          {/* Templates dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg text-sm transition-all"
            >
              <span>{activeTemplate.icon}</span>
              <span className="text-white font-medium">{activeTemplate.name[language]}</span>
              <motion.span
                animate={{ rotate: showTemplates ? 180 : 0 }}
                className="text-zinc-500"
              >
                ▼
              </motion.span>
            </button>
            
            <AnimatePresence>
              {showTemplates && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-700/50 rounded-xl overflow-hidden shadow-xl z-50"
                >
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateChange(template)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-800/50 transition-colors ${
                        activeTemplate.id === template.id ? 'bg-red-500/10 border-l-2 border-red-500' : ''
                      }`}
                    >
                      <span className="text-xl">{template.icon}</span>
                      <div>
                        <div className="text-white font-medium text-sm">{template.name[language]}</div>
                        <div className="text-zinc-500 text-xs">{template.description[language]}</div>
                      </div>
                      {activeTemplate.id === template.id && (
                        <span className="ml-auto text-red-500">✓</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Auto-run toggle */}
          <button
            onClick={() => setAutoRun(!autoRun)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              autoRun 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50'
            }`}
          >
            {autoRun ? '● Auto' : '○ Auto'}
          </button>
          
          {!autoRun && (
            <button
              onClick={handleRun}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-all"
            >
              ▶ {t('Uruchom', 'Run')}
            </button>
          )}
          
          <div className="w-px h-5 bg-zinc-700/50" />
          
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-zinc-800/50 rounded-lg transition-all group relative"
            title={t('Kopiuj kod', 'Copy code')}
          >
            {copied ? (
              <span className="text-green-400 text-sm">✓</span>
            ) : (
              <span className="text-zinc-400 group-hover:text-white text-sm">📋</span>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-zinc-800/50 rounded-lg transition-all group"
            title={t('Pobierz HTML', 'Download HTML')}
          >
            <span className="text-zinc-400 group-hover:text-white text-sm">📥</span>
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 hover:bg-zinc-800/50 rounded-lg transition-all group"
            title={t('Resetuj', 'Reset')}
          >
            <span className="text-zinc-400 group-hover:text-white text-sm">🔄</span>
          </button>
          
          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`p-2 rounded-lg transition-all ${
              showConsole ? 'bg-zinc-700/50 text-white' : 'hover:bg-zinc-800/50 text-zinc-400'
            }`}
            title={t('Konsola', 'Console')}
          >
            <span className="text-sm">🖥️</span>
            {consoleLogs.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
                {consoleLogs.length > 99 ? '99+' : consoleLogs.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-zinc-800/50 rounded-lg transition-all group"
            title={isFs ? t('Zamknij', 'Close') : t('Pełny ekran', 'Fullscreen')}
          >
            <span className="text-zinc-400 group-hover:text-white text-sm">
              {isFs ? '✕' : '⛶'}
            </span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Editor side */}
        <div className="w-1/2 flex flex-col border-r border-zinc-800/50">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-2 py-2 bg-zinc-900/50 border-b border-zinc-800/50">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'text-white bg-zinc-800/80' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId={isFs ? 'activeTabFs' : 'activeTab'}
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ backgroundColor: tab.color }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Code editor */}
          <div className="flex-1 flex overflow-hidden">
            {/* Line numbers */}
            <div className="w-12 bg-zinc-900/30 border-r border-zinc-800/30 py-3 text-right pr-3 select-none overflow-hidden">
              {getLineNumbers().map(num => (
                <div key={num} className="text-zinc-600 text-xs leading-6 font-mono">
                  {num}
                </div>
              ))}
            </div>
            
            {/* Textarea */}
            <textarea
              value={getCode()}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-transparent text-zinc-300 font-mono text-sm leading-6 p-3 resize-none focus:outline-none"
              spellCheck={false}
              placeholder={t('Wpisz kod tutaj...', 'Type your code here...')}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-t border-zinc-800/50 text-xs text-zinc-500">
            <span>{getLineNumbers().length} {t('linii', 'lines')}</span>
            <span>{getCode().length} {t('znaków', 'chars')}</span>
          </div>
        </div>

        {/* Preview side */}
        <div className="w-1/2 flex flex-col">
          {/* Device selector */}
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/50">
            <span className="text-xs text-zinc-500">{t('Podgląd', 'Preview')}</span>
            <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg p-1">
              {(['desktop', 'tablet', 'mobile'] as DeviceType[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    device === d 
                      ? 'bg-red-500 text-white' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {d === 'desktop' ? '🖥️' : d === 'tablet' ? '📱' : '📱'}
                  <span className="ml-1 hidden sm:inline">
                    {d === 'desktop' ? 'Desktop' : d === 'tablet' ? 'Tablet' : 'Mobile'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview iframe */}
          <div className="flex-1 flex items-center justify-center p-4 bg-zinc-900/30 overflow-auto">
            <div 
              className={`bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ${
                device !== 'desktop' ? 'border-4 border-zinc-700 rounded-[24px]' : ''
              }`}
              style={{ 
                width: getDeviceWidth(),
                height: device === 'mobile' ? '667px' : device === 'tablet' ? '100%' : '100%',
                maxHeight: '100%'
              }}
            >
              {/* Device notch for mobile */}
              {device === 'mobile' && (
                <div className="h-6 bg-zinc-800 flex items-center justify-center">
                  <div className="w-20 h-4 bg-zinc-900 rounded-full" />
                </div>
              )}
              
              <iframe
                ref={iframeRef}
                srcDoc={output}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-modals"
                title="Preview"
              />
            </div>
          </div>

          {/* Console */}
          <AnimatePresence>
            {showConsole && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 150 }}
                exit={{ height: 0 }}
                className="border-t border-zinc-800/50 bg-zinc-950 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/50">
                  <span className="text-xs text-zinc-500 font-medium">
                    🖥️ {t('Konsola', 'Console')} ({consoleLogs.length})
                  </span>
                  <button
                    onClick={() => setConsoleLogs([])}
                    className="text-xs text-zinc-500 hover:text-white transition-colors"
                  >
                    {t('Wyczyść', 'Clear')}
                  </button>
                </div>
                <div className="h-[110px] overflow-y-auto p-2 font-mono text-xs">
                  {consoleLogs.length === 0 ? (
                    <div className="text-zinc-600 text-center py-4">
                      {t('Brak logów...', 'No logs yet...')}
                    </div>
                  ) : (
                    consoleLogs.map(log => (
                      <div
                        key={log.id}
                        className={`flex items-start gap-2 py-1 px-2 rounded ${
                          log.type === 'error' ? 'bg-red-500/10 text-red-400' :
                          log.type === 'warn' ? 'bg-yellow-500/10 text-yellow-400' :
                          log.type === 'info' ? 'bg-blue-500/10 text-blue-400' :
                          'text-zinc-300'
                        }`}
                      >
                        <span className="text-zinc-600 shrink-0">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span className="shrink-0">
                          {log.type === 'error' ? '❌' : 
                           log.type === 'warn' ? '⚠️' : 
                           log.type === 'info' ? 'ℹ️' : '→'}
                        </span>
                        <span className="break-all">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <section id="playground" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.05)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6">
            <span>🎮</span>
            <span>{t('Interaktywny Edytor', 'Interactive Editor')}</span>
          </span>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Code <span className="text-red-500">Playground</span>
          </h2>
          
          <p className="text-zinc-400 max-w-2xl mx-auto">
            {t(
              'Eksperymentuj z kodem HTML, CSS i JavaScript w czasie rzeczywistym. Wybierz szablon lub stwórz coś od zera!',
              'Experiment with HTML, CSS and JavaScript code in real-time. Choose a template or create something from scratch!'
            )}
          </p>
        </motion.div>

        {/* Editor */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {renderEditor(false)}
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: '💡', title: t('Podpowiedź', 'Tip'), text: t('Użyj console.log() aby debugować kod', 'Use console.log() to debug your code') },
            { icon: '📱', title: t('Responsywność', 'Responsive'), text: t('Sprawdź jak wygląda na różnych urządzeniach', 'Check how it looks on different devices') },
            { icon: '📥', title: t('Eksport', 'Export'), text: t('Pobierz gotowy plik HTML', 'Download the complete HTML file') }
          ].map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl"
            >
              <span className="text-xl">{tip.icon}</span>
              <div>
                <h4 className="text-white font-medium text-sm">{tip.title}</h4>
                <p className="text-zinc-500 text-xs">{tip.text}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsFullscreen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full h-full max-w-[1800px] max-h-[95vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {renderEditor(true)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
