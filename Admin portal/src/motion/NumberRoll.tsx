import React, { useEffect, useState, useRef } from 'react';

interface NumberRollProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const NumberRoll: React.FC<NumberRollProps> = ({
  value,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isRolling, setIsRolling] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      const fx = document.documentElement.getAttribute('data-fx');
      if (fx === 'off' || fx === 'lite') {
        setDisplayValue(value);
        prevValueRef.current = value;
        return;
      }

      setIsRolling(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setIsRolling(false);
        prevValueRef.current = value;
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span className={`inline-flex items-baseline font-mono tabular-nums overflow-hidden ${className}`}>
      {prefix && <span className="mr-0.5 text-xs text-[#C9A04A]">{prefix}</span>}
      <span
        className={`inline-block transition-transform duration-300 ease-[var(--e-silk)] ${
          isRolling ? '-translate-y-2 opacity-50' : 'translate-y-0 opacity-100'
        }`}
      >
        {displayValue}
      </span>
      {suffix && <span className="ml-0.5 text-xs text-[#52625D]">{suffix}</span>}
    </span>
  );
};
