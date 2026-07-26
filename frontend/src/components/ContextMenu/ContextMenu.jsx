import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import './ContextMenu.css';
import GearIcon from '../icons/GearIcon';

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
