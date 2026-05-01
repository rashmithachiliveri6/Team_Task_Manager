"use client";
import React, { useEffect, useState } from 'react';

export default function NotificationsView() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(data => {
      setNotifications(data.notifications || []);
      if (data.notifications?.some((n:any) => !n.read)) {
        fetch('/api/notifications', { method: "PUT" });
      }
    });
  }, []);

  return (
    <div>
      <h1 className="page-title" style={{marginBottom: "2rem"}}>Notifications</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {notifications.length === 0 ? <p>No notifications.</p> : notifications.map(n => (
          <div key={n.id} className="stat-card" style={{ padding: "1.5rem", opacity: n.read ? 0.6 : 1 }}>
            <p style={{ fontWeight: n.read ? 'normal' : 'bold', fontSize: "1.1rem" }}>{n.message}</p>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem", display: "block" }}>{new Date(n.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
