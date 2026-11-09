export default function Navigation({ activeTab, onSelectTab, status }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "ocr-lab", label: "OCR Lab", icon: "🔬" },
    { id: "benchmark", label: "Benchmark Lab", icon: "⚡" },
    { id: "settings", label: "Settings", icon: "⚙️" }
  ];

  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-badge">PRO</span>
        <span className="brand-name">MATIKS COMPANION</span>
        <span className="brand-subtitle">ARITHMETIC OCR ENGINE</span>
      </div>

      <nav className="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onSelectTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="system-status">
        <span className="pulse-indicator" />
        <span className="status-label">{status}</span>
      </div>
    </header>
  );
}

