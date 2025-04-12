import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global styles for the Islamic themed application
const style = document.createElement('style');
style.textContent = `
  :root {
    --primary: 168 78% 29%;
    --primary-foreground: 0 0% 100%;
    
    --secondary: 42 84% 45%;
    --secondary-foreground: 0 0% 100%;
    
    --accent: 208 53% 63%;
    --accent-foreground: 0 0% 100%;
    
    --background: 0 0% 100%;
    --foreground: 218 17% 23%;
    
    --card: 0 0% 100%;
    --card-foreground: 218 17% 23%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 218 17% 23%;
    
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    
    --ring: 168 78% 29%;
    
    --radius: 0.5rem;
  }

  .pattern-bg {
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310846E' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  
  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Playfair Display', serif;
  }
  
  body {
    font-family: 'Roboto', sans-serif;
  }
  
  .font-arabic {
    font-family: 'Amiri', serif;
  }
  
  /* Custom Mosque Dome Icon */
  .mosque-dome {
    position: relative;
    width: 60px;
    height: 40px;
    border-radius: 100% 100% 0 0 / 100% 100% 0 0;
    background-color: #10846E;
    margin: 0 auto;
  }
  
  .mosque-dome::after {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    width: 10px;
    height: 15px;
    background-color: #D4A014;
    transform: translateX(-50%);
    border-radius: 5px 5px 0 0;
  }
`;

document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
