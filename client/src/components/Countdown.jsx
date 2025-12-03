import { useState, useEffect } from 'react';

function Countdown({ targetDate, label = "Reunion starts in" }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(targetDate) - new Date();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isComplete: false
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isComplete) {
    return (
      <div className="countdown-complete">
        <div className="text-2xl font-semibold text-orange-600">
          The reunion is happening now!
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-container">
      <p className="countdown-label">{label}</p>
      <div className="countdown-grid">
        <CountdownUnit value={timeLeft.days} label="Days" />
        <div className="countdown-separator">:</div>
        <CountdownUnit value={timeLeft.hours} label="Hours" />
        <div className="countdown-separator">:</div>
        <CountdownUnit value={timeLeft.minutes} label="Mins" />
        <div className="countdown-separator md:block hidden">:</div>
        <div className="hidden md:block">
          <CountdownUnit value={timeLeft.seconds} label="Secs" />
        </div>
      </div>
    </div>
  );
}

function CountdownUnit({ value, label }) {
  return (
    <div className="countdown-unit">
      <div className="countdown-value">
        {String(value).padStart(2, '0')}
      </div>
      <div className="countdown-unit-label">{label}</div>
    </div>
  );
}

export default Countdown;
