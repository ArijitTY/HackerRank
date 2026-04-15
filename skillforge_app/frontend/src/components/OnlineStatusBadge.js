import React from 'react';

const CONFIG = {
  online:  { color: '#1D9E75',          bg: 'rgba(29,158,117,0.15)',  border: 'rgba(29,158,117,0.3)',  label: 'Online',  dotColor: '#1D9E75',          pulse: true  },
  idle:    { color: '#BA7517',          bg: 'rgba(186,117,23,0.15)',  border: 'rgba(186,117,23,0.3)',  label: 'Idle',    dotColor: '#BA7517',          pulse: false },
  offline: { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', label: 'Offline', dotColor: 'rgba(255,255,255,0.3)', pulse: false },
  in_test: { color: '#185FA5',          bg: 'rgba(24,95,165,0.15)',   border: 'rgba(24,95,165,0.3)',   label: 'In Test', dotColor: '#185FA5',          pulse: true  },
};

const OnlineStatusBadge = ({ status, lastSeenRelative, showLabel = true, size = 'md' }) => {
  const c = CONFIG[status] || CONFIG.offline;
  const dotSize = size === 'sm' ? 7 : 9;
  const fontSize = size === 'sm' ? 11 : 12;
  const padding = size === 'sm' ? '2px 8px' : '3px 10px';

  let title;
  if (status === 'online') title = 'Active now';
  else if (status === 'in_test') title = 'Currently taking a test';
  else if (lastSeenRelative && lastSeenRelative !== 'Never') title = 'Last seen: ' + lastSeenRelative;
  else title = 'Never logged in';

  return (
    <span
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: showLabel ? padding : 4,
        borderRadius: 99,
        background: c.bg,
        border: '1px solid ' + c.border,
        fontSize: fontSize,
        fontWeight: 500,
        color: c.color,
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}
    >
      <span style={{
        width: dotSize,
        height: dotSize,
        borderRadius: '50%',
        background: c.dotColor,
        flexShrink: 0,
        display: 'inline-block',
        animation: c.pulse ? 'onlineStatusPulse 2s infinite' : 'none',
      }} />
      {showLabel && <span>{c.label}</span>}
    </span>
  );
};

export default OnlineStatusBadge;
