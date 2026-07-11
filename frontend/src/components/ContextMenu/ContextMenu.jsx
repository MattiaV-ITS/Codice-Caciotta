import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import './ContextMenu.css';

// Helper to keep menu inside viewport
const adjustPosition = (top, left, menuWidth, menuHeight) => {
  const padding = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (left + menuWidth > vw - padding) left = vw - menuWidth - padding;
  if (left < padding) left = padding;
  if (top + menuHeight > vh - padding) top = vh - menuHeight - padding;
  if (top < padding) top = padding;

  return { top, left };
};

// ------------------------------------------------------------------
// Shared Menu component (rendered via portal)
// ------------------------------------------------------------------
const Menu = ({
  isOpen,
  onClose,
  position, // { top, left } in viewport coords
  menuItems,
  className = 'context-menu',
}) => {
  const menuRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Recalculate position after menu measures itself
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    setAdjustedPosition(adjustPosition(
      position.top,
      position.left,
      rect.width,
      rect.height
    ));
  }, [isOpen, position]);

  // Close on outside click, scroll, resize
  useEffect(() => {
    if (!isOpen) return;

    const handleClose = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleScrollOrResize = () => onClose();

    document.addEventListener('mousedown', handleClose);
    document.addEventListener('scroll', handleScrollOrResize, true); // capture all scroll events
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClose);
      document.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, onClose]);

  // Keyboard navigation (arrows, Enter, Escape)
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    const items = menuRef.current?.querySelectorAll('.context-menu-item');
    if (!items) return;

    let index = Array.from(items).findIndex(el => el === document.activeElement);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        index = (index + 1) % items.length;
        items[index]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        index = (index - 1 + items.length) % items.length;
        items[index]?.focus();
        break;
      case 'Escape':
        onClose();
        break;
      case 'Enter':
      case ' ':
        if (index >= 0) {
          e.preventDefault();
          items[index]?.click();
        }
        break;
      default: break;
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Auto‑focus first item
      const timer = setTimeout(() => {
        const first = menuRef.current?.querySelector('.context-menu-item');
        if (first) first.focus();
      }, 10);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !menuItems?.length) return null;

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      className={className}
      style={{
        position: 'fixed',
        top: adjustedPosition.top,
        left: adjustedPosition.left,
        zIndex: 10000,
      }}
      role="menu"
      aria-label="Menu"
    >
      {menuItems.map((item, index) => (
        <div
          key={index}
          className="context-menu-item"
          tabIndex={0}
          role="menuitem"
          onClick={(e) => {
            e.stopPropagation();
            item.onClick?.();
            onClose();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              item.onClick?.();
              onClose();
            }
          }}
        >
          {item.icon && <span className="context-menu-icon">{item.icon}</span>}
          <span>{item.label}</span>
        </div>
      ))}
    </div>,
    document.body
  );
};

// ------------------------------------------------------------------
// ContextMenu – triggered by right‑click
// ------------------------------------------------------------------
export const ContextMenu = ({ children, menuItems, onClose }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isOpen, setIsOpen] = useState(false);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setPosition({ top: e.clientY, left: e.clientX });
    setIsOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  return (
    <div onContextMenu={handleContextMenu} style={{ display: 'inline-block' }}>
      {children}
      <Menu isOpen={isOpen} onClose={closeMenu} position={position} menuItems={menuItems} />
    </div>
  );
};

// ------------------------------------------------------------------
// GearMenu – triggered by clicking the gear button
// ------------------------------------------------------------------
export const GearMenu = ({ menuItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const toggleMenu = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isOpen) {
      setIsOpen(false);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const menuWidth = 180; // matches min-width from CSS
      setPosition({
        top: rect.bottom + 4,
        left: rect.right - menuWidth,
      });
    }
    setIsOpen(true);
  }, [isOpen]);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        className="gear-button"
        onClick={toggleMenu}
        aria-label="Menu azioni"
        aria-expanded={isOpen}
      >
        <GearIcon />
      </button>
      <Menu isOpen={isOpen} onClose={closeMenu} position={position} menuItems={menuItems} />
    </div>
  );
};

// ------------------------------------------------------------------
// Gear Icon (unchanged from your original)
// ------------------------------------------------------------------
const GearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" fill="var(--gray-600)" stroke="var(--gray-600)" strokeWidth="1.5"/>
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="var(--gray-600)" strokeWidth="1.5"/>
    <path d="M12 15.5C11.3013 15.5 10.636 15.2734 10.1213 14.8787C9.60656 14.484 9.3 13.9187 9.3 13.25C9.3 12.5813 9.60656 12.016 10.1213 11.6213C10.636 11.2266 11.3013 11 12 11" stroke="var(--gray-600)" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M14.7 11C15.4013 11 16.066 11.2266 16.5813 11.6213C17.096 12.016 17.4 12.5813 17.4 13.25C17.4 13.9187 17.096 14.484 16.5813 14.8787C16.066 15.2734 15.4013 15.5 14.7 15.5" stroke="var(--gray-600)" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 8.5C12.6987 8.5 13.364 8.72656 13.8787 9.1213C14.3934 9.51602 14.7 10.0813 14.7 10.75C14.7 11.4187 14.3934 11.984 13.8787 12.3787C13.364 12.7734 12.6987 13 12 13" stroke="var(--gray-600)" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9.3 13C8.59871 13 7.93398 12.7734 7.41869 12.3787C6.90398 11.984 6.6 11.4187 6.6 10.75C6.6 10.0813 6.90398 9.51602 7.41869 9.1213C7.93398 8.72656 8.59871 8.5 9.3 8.5" stroke="var(--gray-600)" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);