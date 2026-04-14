import { useState } from "react";
import Icon from "../../components/Icon";
import { RevealDiv } from "../../components/ScrollReveal";
import { updateUserPassword } from "../../api/authService";

export default function SecurityPage({ user }) {
  const [showPassForm, setShowPassForm] = useState(false);
  const [passData, setPassData] = useState({ current: "", new: "", confirm: "" });
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState({ text: "", type: "" });

  const sessions = user?.sessions || [];
  const currentSessionId = sessionStorage.getItem("sm_session_id");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return setPassMsg({ text: "New passwords do not match.", type: "error" });
    if (passData.new.length < 6) return setPassMsg({ text: "Password must be at least 6 characters.", type: "error" });
    
    setPassLoading(true);
    setPassMsg({ text: "", type: "" });
    
    const { error } = await updateUserPassword(passData.current, passData.new);
    setPassLoading(false);
    
    if (error) {
      setPassMsg({ text: error, type: "error" });
    } else {
      setPassMsg({ text: "Password updated successfully!", type: "success" });
      setPassData({ current: "", new: "", confirm: "" });
      setTimeout(() => setShowPassForm(false), 2000);
    }
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: 800, margin: "0 auto", animation: "fadeInUp 0.35s ease" }}>
      <RevealDiv>
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontWeight: 900, fontSize: "1.8rem", color: "#fff", marginBottom: "0.5rem" }}>Security</h2>
          <p style={{ color: "#555", fontSize: "14px" }}>Manage your account security and monitor recent access.</p>
        </div>
      </RevealDiv>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {/* Authentication Card */}
        <RevealDiv delay={100}>
          <div style={{
            background: "#0a0a0a",
            border: "1px solid #141414",
            borderRadius: "var(--r-xl)",
            padding: "2rem",
          }}>
            <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#fff", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="shield" size={18} color="#a8ff6c" />
              Login Security
            </h4>
            
            <div style={{ display: "grid", gap: "1.2rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showPassForm ? "1.5rem" : 0 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#eee", fontSize: "14px" }}>Password</div>
                    <div style={{ fontSize: "12px", color: "#444" }}>Update your password to stay secure.</div>
                  </div>
                  {!showPassForm && (
                    <button 
                      onClick={() => setShowPassForm(true)}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid #222",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >Change Password</button>
                  )}
                </div>

                {showPassForm && (
                  <form onSubmit={handlePasswordChange} style={{ animation: "fadeIn 0.2s ease" }}>
                    <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
                       <input 
                         type="password" placeholder="Current Password" 
                         value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})}
                         style={{ width: "100%", background: "#111", border: "1px solid #222", color: "#fff", padding: "10px", borderRadius: "10px", outline: "none", fontSize: "13px" }}
                       />
                       <input 
                         type="password" placeholder="New Password" 
                         value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})}
                         style={{ width: "100%", background: "#111", border: "1px solid #222", color: "#fff", padding: "10px", borderRadius: "10px", outline: "none", fontSize: "13px" }}
                       />
                       <input 
                         type="password" placeholder="Confirm New Password" 
                         value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})}
                         style={{ width: "100%", background: "#111", border: "1px solid #222", color: "#fff", padding: "10px", borderRadius: "10px", outline: "none", fontSize: "13px" }}
                       />
                    </div>
                    {passMsg.text && (
                      <div style={{ 
                        fontSize: "12px", fontWeight: 600, marginBottom: "1rem",
                        color: passMsg.type === "error" ? "#ff4d6d" : "#a8ff6c" 
                      }}>{passMsg.text}</div>
                    )}
                    <div style={{ display: "flex", gap: "10px" }}>
                       <button onClick={() => setShowPassForm(false)} type="button" style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "#1a1a1a", border: "none", color: "#666", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                       <button disabled={passLoading} type="submit" style={{ flex: 2, padding: "10px", borderRadius: "10px", background: "#a8ff6c", border: "none", color: "#000", fontWeight: 800, cursor: "pointer", boxShadow: "0 0 15px rgba(168,255,108,0.2)" }}>
                         {passLoading ? "Updating..." : "Update Password"}
                       </button>
                    </div>
                  </form>
                )}
              </div>

              <div style={{ borderTop: "1px solid #111", paddingTop: "1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#eee", fontSize: "14px" }}>Two-Factor Authentication (2FA)</div>
                  <div style={{ fontSize: "12px", color: "#444" }}>Adds an extra layer of security to your account.</div>
                </div>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#444", border: "1px solid #222", padding: "3px 8px", borderRadius: "12px" }}>COMING SOON</span>
              </div>
            </div>
          </div>
        </RevealDiv>

        {/* Sessions Card */}
        <RevealDiv delay={200}>
          <div style={{
            background: "#0a0a0a",
            border: "1px solid #141414",
            borderRadius: "var(--r-xl)",
            padding: "2rem",
          }}>
            <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#fff", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="zap" size={18} color="#facc15" />
              Active Sessions
            </h4>
            
            <div style={{ display: "grid", gap: "1rem" }}>
              {sessions.length > 0 ? sessions.sort((a,b) => b.lastActive - a.lastActive).map((session, idx) => (
                <div key={session.id || idx} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    paddingBottom: "1rem",
                    borderBottom: idx !== sessions.length - 1 ? "1px solid #080808" : "none"
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#eee", fontSize: "13px" }}>{session.label}</div>
                    <div style={{ fontSize: "11px", color: "#333", display: "flex", gap: "8px" }}>
                        <span>Last Active: {new Date(session.lastActive).toLocaleString()}</span>
                    </div>
                  </div>
                  {(session.id === currentSessionId) && (
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#a8ff6c", background: "rgba(168,255,108,0.1)", padding: "2px 8px", borderRadius: "8px" }}>CURRENT DEVICE</span>
                  )}
                </div>
              )) : (
                <div style={{ color: "#333", fontSize: "13px", fontStyle: "italic" }}>No active sessions recorded yet.</div>
              )}
            </div>
          </div>
        </RevealDiv>
      </div>
    </div>
  );
}
