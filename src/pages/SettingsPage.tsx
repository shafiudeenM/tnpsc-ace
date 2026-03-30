import { motion } from "framer-motion";
import { Settings, Globe, Bell, User, Shield, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">Settings</h1>

      <div className="space-y-4">
        {[
          { icon: User, label: "Profile", desc: "Manage your account details" },
          { icon: Globe, label: "Language", desc: "Switch between English and Tamil" },
          { icon: Bell, label: "Notifications", desc: "Quiz reminders & daily digest" },
          { icon: Shield, label: "Privacy", desc: "Data and privacy settings" },
          { icon: Palette, label: "Appearance", desc: "Theme and display preferences" },
        ].map((item) => (
          <div key={item.label} className="feature-card flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
