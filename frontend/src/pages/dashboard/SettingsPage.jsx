import Icon from "../../components/Icon";
import { RevealDiv } from "../../components/ScrollReveal";
import { updateUserSettings } from "../../api/authService";

export default function SettingsPage({ user }) {
  const currentSettings = user?.settings || {
    notifications: { email: true, browser: true, security: true, newFeatures: false },
    explorer: "Etherscan"
  };

  const toggle = async (field) => {
    const newNotifications = { 
        ...currentSettings.notifications, 
        [field]: !currentSettings.notifications[field] 
    };
    await updateUserSettings(user.uid, { ...currentSettings, notifications: newNotifications });
  };

  const setExplorer = async (val) => {
    await updateUserSettings(user.uid, { ...currentSettings, explorer: val });
  };

  const settingsItems = [
    { 
        label: "Email Notifications", 
        desc: "Receive alert triggers and security reports directly in your inbox.", 
        enabled: currentSettings.notifications.email, 
        onToggle: () => toggle("email") 
    },
    { 
        label: "Browser Notifications", 
        desc: "Get real-time feedback and vulnerability alerts on your desktop.", 
        enabled: currentSettings.notifications.browser, 
        onToggle: () => toggle("browser") 
    },
    { 
        label: "Security Alerts", 
        desc: "Critical updates on account access and detected reentrancy threats.", 
        enabled: currentSettings.notifications.security, 
        onToggle: () => toggle("security") 
    },
    { 
        label: "New Product Features", 
        desc: "Be the first to know about new AI models and contract templates.", 
        enabled: currentSettings.notifications.newFeatures, 
        onToggle: () => toggle("newFeatures") 
    },
  ];

  return (
    <div style={{ padding: "1.5rem", maxWidth: 800, margin: "0 auto", animation: "fadeInUp 0.35s ease" }}>
      <RevealDiv>
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontWeight: 900, fontSize: "1.8rem", color: "#fff", marginBottom: "0.5rem" }}>Settings</h2>
          <p style={{ color: "#555", fontSize: "14px" }}>Configure your experience and preferences on Smart Guard.</p>
        </div>
      </RevealDiv>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {/* Preference Section */}
        <RevealDiv delay={100}>
          <div style={{
            background: "#0a0a0a",
            border: "1px solid #141414",
            borderRadius: "var(--r-xl)",
            padding: "2rem",
          }}>
            <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#fff", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="bell" size={18} color="#fb923c" />
              Notifications
            </h4>
            
            <div style={{ display: "grid", gap: "1rem" }}>
              {settingsItems.map((item, idx) => (
                <div key={idx} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    padding: "1rem",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#eee", fontSize: "14px", marginBottom: "2px" }}>{item.label}</div>
                    <div style={{ fontSize: "12px", color: "#444" }}>{item.desc}</div>
                  </div>
                  <button 
                    onClick={item.onToggle}
                    style={{
                        position: "relative",
                        width: 44, height: 22,
                        borderRadius: "20px",
                        background: item.enabled ? "#a8ff6c" : "#1a1a1a",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        padding: 0
                    }}
                  >
                    <div style={{
                        position: "absolute",
                        top: 3,
                        left: item.enabled ? 25 : 3,
                        width: 16, height: 16,
                        borderRadius: "50%",
                        background: item.enabled ? "#000" : "#444",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </RevealDiv>

        {/* Preferences */}
        <RevealDiv delay={200}>
            <div style={{
                background: "#0a0a0a",
                border: "1px solid #141414",
                borderRadius: "var(--r-xl)",
                padding: "2rem",
            }}>
                <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#fff", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Icon name="home" size={18} color="#00e5ff" />
                    Display Preferences
                </h4>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px" }}>
                    <div style={{ fontSize: "14px", color: "#eee", fontWeight: 600 }}>Default Explorer</div>
                    <select 
                        value={currentSettings.explorer}
                        onChange={(e) => setExplorer(e.target.value)}
                        style={{ 
                            background: "#111", border: "1px solid #222", color: "#eee", 
                            padding: "6px 12px", borderRadius: "8px", outline: "none", fontSize: "12px" 
                        }}
                    >
                        <option>Etherscan</option>
                        <option>Basescan</option>
                        <option>Blockscout</option>
                    </select>
                </div>
            </div>
        </RevealDiv>
      </div>
    </div>
  );
}
