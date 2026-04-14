import { useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../../components/Icon";
import { RevealDiv } from "../../components/ScrollReveal";
import { useWallet } from "../../hooks/useWallet";
import { updateUserProfile } from "../../api/authService";

function EditProfileModal({ user, onClose }) {
  const [name, setName] = useState(user.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim()) return setError("Name is required");
    setLoading(true);
    const { error: err } = await updateUserProfile(user.uid, { name });
    setLoading(false);
    if (err) setError(err);
    else onClose();
  };

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem", animation: "fadeIn 0.2s ease"
    }}>
      <div style={{
        background: "#0a0a0a", border: "1px solid rgba(168,255,108,0.2)",
        borderRadius: "24px", width: "100%", maxWidth: "420px",
        padding: "2rem", boxShadow: "0 0 50px rgba(0,0,0,0.5), 0 0 30px rgba(168,255,108,0.05)",
        position: "relative"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", marginBottom: "0.5rem" }}>Edit Profile</h3>
          <p style={{ fontSize: "14px", color: "#555" }}>Update your public identity on Smart Guard.</p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontSize: "11px", color: "#a8ff6c", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase" }}>Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name"
            style={{
              width: "100%", background: "#111", border: "1px solid #222",
              borderRadius: "12px", padding: "12px 16px", color: "#fff", outline: "none",
              transition: "border 0.2s"
            }}
            onFocus={e => e.target.style.borderColor = "#a8ff6c"}
            onBlur={e => e.target.style.borderColor = "#222"}
          />
          {error && <div style={{ color: "#ff4d6d", fontSize: "12px", marginTop: "8px", fontWeight: 600 }}>{error}</div>}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            onClick={onClose}
            style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "#1a1a1a", color: "#888", border: "none", fontWeight: 700, cursor: "pointer" }}
          >Cancel</button>
          <button 
            onClick={handleSave}
            disabled={loading}
            style={{ 
              flex: 1, padding: "12px", borderRadius: "12px", 
              background: "#a8ff6c", color: "#000", border: "none", 
              fontWeight: 800, cursor: "pointer", 
              boxShadow: "0 4px 15px rgba(168,255,108,0.3)",
              opacity: loading ? 0.7 : 1
            }}
          >{loading ? "Saving..." : "Save Changes"}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ProfilePage({ user }) {
  const { address, connected } = useWallet();
  const [isEditing, setIsEditing] = useState(false);

  const infoItems = [
    { label: "Full Name", value: user.name, icon: "user" },
    { label: "Email Address", value: user.email, icon: "mail" },
    { label: "Account UID", value: user.uid, icon: "shield", mono: true },
    { label: "Plan Type", value: user.plan?.toUpperCase() || "FREE", icon: "zap", highlight: true },
  ];

  return (
    <div style={{ padding: "1.5rem", maxWidth: 800, margin: "0 auto", animation: "fadeInUp 0.35s ease" }}>
      {isEditing && <EditProfileModal user={user} onClose={() => setIsEditing(false)} />}
      <RevealDiv>
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontWeight: 900, fontSize: "1.8rem", color: "#fff", marginBottom: "0.5rem" }}>My Profile</h2>
          <p style={{ color: "#555", fontSize: "14px" }}>Manage your personal information and account status.</p>
        </div>
      </RevealDiv>

      <div style={{ display: "grid", gap: "1.5rem" }}>
        {/* Profile Card */}
        <RevealDiv delay={100}>
          <div style={{
            background: "#0a0a0a",
            border: "1px solid #141414",
            borderRadius: "var(--r-xl)",
            padding: "2rem",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
              <div style={{
                width: 80, height: 80, borderRadius: "50%",
                background: "linear-gradient(135deg, #a8ff6c, #00e5ff)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", fontWeight: 900, color: "#000"
              }}>
                {user.photoURL ? <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : (user.name || "U")[0].toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>{user.name}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", padding: "3px 8px", borderRadius: "12px", background: "rgba(168,255,108,0.1)", color: "#a8ff6c", fontWeight: 700 }}>
                    {user.plan?.toUpperCase() || "FREE"} MEMBER
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
              {infoItems.map((item, idx) => (
                <div key={idx}>
                  <div style={{ fontSize: "11px", color: "#444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                    {item.label}
                  </div>
                  <div style={{ 
                    fontSize: "15px", 
                    color: item.highlight ? "#a8ff6c" : "#eee", 
                    fontWeight: 600,
                    fontFamily: item.mono ? "var(--mono)" : "inherit"
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealDiv>

        {/* Wallet Section */}
        <RevealDiv delay={200}>
          <div style={{
            background: "#0a0a0a",
            border: "1px solid #141414",
            borderRadius: "var(--r-xl)",
            padding: "2rem",
          }}>
            <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#fff", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon name="wallet" size={18} color="#a8ff6c" />
              Connected Wallet
            </h4>
            {connected ? (
              <div style={{
                background: "rgba(168,255,108,0.03)",
                border: "1px solid rgba(168,255,108,0.1)",
                borderRadius: "12px",
                padding: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ fontFamily: "var(--mono)", color: "#eee", fontSize: "14px" }}>{address}</div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#a8ff6c", background: "rgba(168,255,108,0.1)", padding: "4px 8px", borderRadius: "6px" }}>ACTIVE</div>
              </div>
            ) : (
              <div style={{ color: "#444", fontSize: "14px", fontStyle: "italic" }}>
                No Web3 wallet connected. Use the "Connect Wallet" button in the dashboard to link your Ethereum account.
              </div>
            )}
          </div>
        </RevealDiv>

        <RevealDiv delay={300}>
           <button 
           onClick={() => setIsEditing(true)}
           style={{
             background: "rgba(255,255,255,0.05)",
             border: "1px solid #222",
             color: "#fff",
             padding: "0.8rem 1.5rem",
             borderRadius: "var(--r-pill)",
             fontWeight: 700,
             fontSize: "13px",
             cursor: "pointer",
             transition: "all 0.2s"
           }}
           onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
           onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
           >
             Edit Profile Settings
           </button>
        </RevealDiv>
      </div>
    </div>
  );
}
