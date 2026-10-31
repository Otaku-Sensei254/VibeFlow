import { useState } from "react";
import { adminApi } from "../../utils/api";
import { motion } from "framer-motion";

const STATES = {
  IDLE: "idle",
  SENDING: "sending",
  SUCCESS: "success",
  ERROR: "error",
};

// Base HTML email template builder — clean, responsive, generous width, zero AI border slop
function wrapEmail({ badge, title, subtitle, mainHtml, ctaText, ctaUrl, footerNote }) {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;background-color:#f4f4f5;margin:0;padding:36px 0;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
  <tr>
    <td align="center" style="padding:0 16px;">
      <!--[if (gte mso 9)|(IE)]>
      <table align="center" border="0" cellspacing="0" cellpadding="0" width="640">
      <tr>
      <td align="center" valign="top" width="640">
      <![endif]-->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;width:100%;margin:0 auto;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:8px;">
        <!-- Header -->
        <tr>
          <td style="padding:24px 36px;border-bottom:1px solid #f4f4f5;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="font-size:18px;font-weight:800;color:#0d9488;letter-spacing:-0.02em;">
                  🌊 VibeFlow
                </td>
                <td align="right">
                  <span style="font-size:11px;font-weight:700;color:#0d9488;background-color:#f0fdfa;border:1px solid #ccfbf1;padding:4px 12px;border-radius:9999px;text-transform:uppercase;letter-spacing:0.04em;display:inline-block;">
                    ${badge}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Main Content -->
        <tr>
          <td style="padding:36px 36px 28px 36px;">
            <h1 style="margin:0 0 12px 0;font-size:23px;font-weight:800;color:#09090b;letter-spacing:-0.02em;line-height:1.3;">
              ${title}
            </h1>
            <p style="margin:0 0 20px 0;font-size:15px;color:#71717a;line-height:1.6;">
              ${subtitle}
            </p>
            <div style="font-size:15px;line-height:1.65;color:#3f3f46;">
              ${mainHtml}
            </div>
            ${ctaUrl ? `
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-top:28px;">
              <tr>
                <td align="center" style="border-radius:10px;background-color:#0d9488;">
                  <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:10px;display:inline-block;letter-spacing:0.01em;">
                    ${ctaText} &rarr;
                  </a>
                </td>
              </tr>
            </table>` : ""}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 36px;background-color:#fafafa;border-top:1px solid #f4f4f5;font-size:12px;color:#71717a;line-height:1.6;">
            <p style="margin:0 0 6px 0;font-weight:600;color:#52525b;">The VibeFlow Team</p>
            <p style="margin:0 0 10px 0;">${footerNote || "You received this email because you are a registered member of VibeFlow."}</p>
            <div style="font-size:11px;color:#a1a1aa;">
              <a href="https://vibe-flow-snmr.vercel.app" target="_blank" rel="noopener noreferrer" style="color:#71717a;text-decoration:underline;">VibeFlow</a> &bull; 
              <a href="https://vibe-flow-snmr.vercel.app/settings" target="_blank" rel="noopener noreferrer" style="color:#71717a;text-decoration:underline;">Preferences</a> &bull; 
              <a href="https://vibe-flow-snmr.vercel.app/terms" target="_blank" rel="noopener noreferrer" style="color:#71717a;text-decoration:underline;">Terms</a>
            </div>
          </td>
        </tr>
      </table>
      <!--[if (gte mso 9)|(IE)]>
      </td>
      </tr>
      </table>
      <![endif]-->
    </td>
  </tr>
</table>`;
}

const TEMPLATES = {
  announcement: {
    name: "Product Announcement",
    description: "Launch new features and updates with high visual polish",
    icon: "🎉",
    subject: "🎉 New Update: {title}",
    body: wrapEmail({
      badge: "Product Update",
      title: "{title}",
      subtitle: "Hi {{username}}, we're excited to introduce our latest enhancements to your creative flow.",
      mainHtml: `<p style="margin:0 0 16px 0;">{description}</p>
<div style="background-color:#f8fafc;border:1px solid #f1f5f9;border-radius:12px;padding:20px 24px;margin:20px 0;width:100%;box-sizing:border-box;">
  <p style="margin:0 0 10px 0;font-weight:700;color:#09090b;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">What's New</p>
  <div style="font-size:14px;color:#475569;line-height:1.7;white-space:pre-wrap;">{bullets}</div>
</div>
<p style="margin:0;font-size:14px;color:#71717a;">Head over to the platform to start using these updates right away.</p>`,
      ctaText: "Explore Now",
      ctaUrl: "{cta_link}",
    }),
  },
  newsletter: {
    name: "Weekly Digest",
    description: "Regular newsletter with highlights and creator spotlights",
    icon: "📰",
    subject: "📰 VibeFlow Weekly — {date}",
    body: wrapEmail({
      badge: "Weekly Digest",
      title: "VibeFlow Weekly Digest",
      subtitle: "Hi {{username}}, here's a handpicked curation of what's happening across the community this week.",
      mainHtml: `<div style="background-color:#f8fafc;border:1px solid #f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:18px;width:100%;box-sizing:border-box;">
  <p style="margin:0 0 10px 0;font-weight:700;color:#09090b;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">🔥 This Week's Highlights</p>
  <div style="font-size:14px;color:#475569;line-height:1.7;white-space:pre-wrap;">{highlights}</div>
</div>
<div style="background-color:#f8fafc;border:1px solid #f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:18px;width:100%;box-sizing:border-box;">
  <p style="margin:0 0 10px 0;font-weight:700;color:#09090b;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">🌟 Community Spotlight</p>
  <div style="font-size:14px;color:#475569;line-height:1.7;">{spotlight}</div>
</div>
<div style="background-color:#f0fdfa;border:1px solid #ccfbf1;border-radius:12px;padding:18px 24px;width:100%;box-sizing:border-box;">
  <p style="margin:0 0 8px 0;font-weight:700;color:#0d9488;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">💡 Creator Tip</p>
  <p style="margin:0;font-size:14px;color:#134e4a;line-height:1.6;">{tip}</p>
</div>`,
      ctaText: "Read on VibeFlow",
      ctaUrl: "{blog_link}",
    }),
  },
  welcome: {
    name: "Welcome Series",
    description: "Warm welcome sequence for newly registered members",
    icon: "👋",
    subject: "👋 Welcome to VibeFlow, {{username}}!",
    body: wrapEmail({
      badge: "Welcome",
      title: "Welcome to VibeFlow! 🎉",
      subtitle: "Hi {{username}}, we're thrilled to have you join our growing ecosystem of creators and builders.",
      mainHtml: `<div style="background-color:#f8fafc;border:1px solid #f1f5f9;border-radius:12px;padding:22px 26px;margin-bottom:20px;width:100%;box-sizing:border-box;">
  <p style="margin:0 0 12px 0;font-weight:700;color:#09090b;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">🚀 4 Ways to Get Started</p>
  <ol style="margin:0;padding-left:22px;font-size:14px;color:#475569;line-height:1.9;">
    <li><strong>Complete your profile:</strong> Add an avatar and creative bio</li>
    <li><strong>Explore the Currents:</strong> Discover audio clips and fresh ideas</li>
    <li><strong>Create your first post:</strong> Share your thoughts with the feed</li>
    <li><strong>Drop a Drift:</strong> Leave an ephemeral vibe note for others</li>
  </ol>
</div>
<div style="background-color:#f0fdfa;border:1px solid #ccfbf1;border-radius:12px;padding:16px 22px;width:100%;box-sizing:border-box;">
  <p style="margin:0;font-size:13px;color:#134e4a;line-height:1.6;"><strong>Pro Tip:</strong> Use topic tags like #design or #tech to help like-minded creators discover your posts.</p>
</div>`,
      ctaText: "Jump into Your Feed",
      ctaUrl: "https://vibe-flow-snmr.vercel.app/feed",
    }),
  },
  maintenance: {
    name: "Maintenance Notice",
    description: "System updates, scheduled maintenance, and downtime",
    icon: "⚙️",
    subject: "⚙️ Scheduled Maintenance: {date}",
    body: wrapEmail({
      badge: "Maintenance",
      title: "Upcoming Scheduled Maintenance",
      subtitle: "Hi {{username}}, we wanted to give you advance notice regarding upcoming infrastructure maintenance.",
      mainHtml: `<div style="background-color:#fefce8;border:1px solid #fef08a;border-radius:12px;padding:20px 24px;margin-bottom:20px;width:100%;box-sizing:border-box;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#713f12;line-height:1.9;width:100%;">
    <tr><td style="font-weight:700;width:110px;">When:</td><td>{date} at {time} UTC</td></tr>
    <tr><td style="font-weight:700;">Duration:</td><td>~{duration}</td></tr>
    <tr><td style="font-weight:700;">Impact:</td><td>{impact}</td></tr>
  </table>
</div>
<p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;">During this maintenance window, background tasks and indexing may cause brief service interruptions.</p>
<p style="margin:0;font-size:14px;color:#71717a;line-height:1.6;">We appreciate your patience while we work to keep VibeFlow fast and reliable.</p>`,
      ctaText: "Check Service Status",
      ctaUrl: "https://vibe-flow-snmr.vercel.app",
    }),
  },
  reengagement: {
    name: "Re-engagement",
    description: "Friendly check-in with inactive users and comeback perks",
    icon: "✨",
    subject: "We miss you, {{username}} 👋",
    body: wrapEmail({
      badge: "We Miss You",
      title: "It's been a while since your last visit!",
      subtitle: "Hi {{username}}, things have been moving quickly on VibeFlow and we'd love to see you back.",
      mainHtml: `<div style="background-color:#f8fafc;border:1px solid #f1f5f9;border-radius:12px;padding:20px 24px;margin-bottom:20px;width:100%;box-sizing:border-box;">
  <p style="margin:0 0 12px 0;font-weight:700;color:#09090b;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">✨ What You Missed</p>
  <div style="font-size:14px;color:#475569;line-height:1.8;white-space:pre-wrap;">{new_features}</div>
  <p style="margin:12px 0 0 0;font-size:13px;color:#64748b;">Community Milestone: {community_milestone}</p>
</div>
<div style="background-color:#fefce8;border:1px solid #fef08a;border-radius:12px;padding:16px 22px;width:100%;box-sizing:border-box;">
  <p style="margin:0;font-size:13px;color:#713f12;line-height:1.6;"><strong>Welcome Back Perk:</strong> {incentive}</p>
</div>`,
      ctaText: "Return to VibeFlow",
      ctaUrl: "{return_link}",
    }),
  },
  custom: {
    name: "Custom HTML",
    description: "Write or paste raw HTML code directly",
    icon: "✏️",
    subject: "Custom Broadcast Message",
    body: wrapEmail({
      badge: "Notice",
      title: "Custom Message Title",
      subtitle: "Hi {{username}}, here is an update from the team.",
      mainHtml: `<p>Your custom announcement text goes here. Feel free to use standard HTML tags for layout and emphasis.</p>`,
      ctaText: "Visit Platform",
      ctaUrl: "https://vibe-flow-snmr.vercel.app",
    }),
  },
};

export default function AdminCommunicationsHub() {
  const [formData, setFormData] = useState({
    subject: TEMPLATES.announcement.subject,
    body: TEMPLATES.announcement.body,
    sender_name: "",
    template: "announcement",
    // Template variables
    title: "VibeFlow 2.0 Studio Upgrade",
    description: "We have released an extensive redesign with faster feeds, upgraded live streams, and sleek dark mode surfaces.",
    bullets: "• Ultra-fast sticky feed navigation\n• Redesigned editorial post detail pages\n• Enhanced real-time chat with presence & message skins",
    cta_link: "https://vibe-flow-snmr.vercel.app/feed",
    date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    highlights: "• Over 20,000 new creators joined this month\n• Trending tags: #AI #LiveStream #CreativeCode\n• New dark mode theme options launched",
    spotlight: "Shoutout to the creative developers streaming and posting in the newly launched VibeFlow Studio!",
    tip: "Tag your posts with #community to be featured in next week's spotlight.",
    blog_link: "https://vibe-flow-snmr.vercel.app/feed",
    time: "02:00",
    duration: "45 minutes",
    impact: "Brief intermittent lag during database indexing",
    new_features: "• Dark mode unification\n• In-app ephemeral Drifts\n• Wave voice clips",
    community_milestone: "Over 50,000 thoughts and posts shared",
    content_highlight: "Explore trending discussions in #Design and #Tech",
    return_link: "https://vibe-flow-snmr.vercel.app/feed",
    incentive: "500 bonus points credited to your account",
  });

  const [state, setState] = useState(STATES.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [previewTab, setPreviewTab] = useState("preview"); // "preview" | "code"

  // Verification reminders state
  const [verificationState, setVerificationState] = useState(STATES.IDLE);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationError, setVerificationError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyTemplate = (templateKey) => {
    const template = TEMPLATES[templateKey];
    if (!template) return;

    setFormData((prev) => ({
      ...prev,
      template: templateKey,
      subject: template.subject || prev.subject,
      body: template.body || prev.body,
    }));
  };

  const renderBody = (body) => {
    if (!body) return "";
    return body
      .replace(/\{\{username\}\}/g, "{{username}}")
      .replace(/\{title\}/g, formData.title || "Latest Update")
      .replace(/\{description\}/g, formData.description || "")
      .replace(/\{bullets\}/g, formData.bullets || "")
      .replace(/\{cta_link\}/g, formData.cta_link || "https://vibe-flow-snmr.vercel.app")
      .replace(/\{date\}/g, formData.date || new Date().toLocaleDateString())
      .replace(/\{highlights\}/g, formData.highlights || "")
      .replace(/\{spotlight\}/g, formData.spotlight || "")
      .replace(/\{tip\}/g, formData.tip || "")
      .replace(/\{blog_link\}/g, formData.blog_link || "https://vibe-flow-snmr.vercel.app")
      .replace(/\{time\}/g, formData.time || "00:00")
      .replace(/\{duration\}/g, formData.duration || "30 minutes")
      .replace(/\{impact\}/g, formData.impact || "Minor service degradation")
      .replace(/\{new_features\}/g, formData.new_features || "")
      .replace(/\{community_milestone\}/g, formData.community_milestone || "")
      .replace(/\{content_highlight\}/g, formData.content_highlight || "")
      .replace(/\{return_link\}/g, formData.return_link || "https://vibe-flow-snmr.vercel.app")
      .replace(/\{incentive\}/g, formData.incentive || "Free bonus badge");
  };

  const previewBody = renderBody(formData.body);
  const previewSubject = formData.subject.replace(/\{\{username\}\}/g, "Alex");

  const handleSendVerificationReminders = async () => {
    setVerificationState(STATES.SENDING);
    setVerificationError(null);
    setVerificationResult(null);

    try {
      const data = await adminApi.sendVerificationReminders({
        sender_name: formData.sender_name,
      });
      setVerificationResult(data);
      setVerificationState(STATES.SUCCESS);
    } catch (err) {
      setVerificationError(
        err.response?.data?.error ||
          err.message ||
          "Failed to send verification reminders. Please try again."
      );
      setVerificationState(STATES.ERROR);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState(STATES.SENDING);
    setError(null);
    setResult(null);

    try {
      const data = await adminApi.sendBroadcastEmail({
        ...formData,
        subject: previewSubject,
        body: previewBody,
      });
      setResult(data);
      setState(STATES.SUCCESS);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to send broadcast email. Please try again."
      );
      setState(STATES.ERROR);
    }
  };

  const isLoading = state === STATES.SENDING;
  const currentTemplate = TEMPLATES[formData.template];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              Communications Hub
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Design and dispatch responsive, beautifully branded emails to all registered members.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tide-50 dark:bg-tide-900/30 text-tide-700 dark:text-tide-300 text-xs font-semibold self-start sm:self-auto border border-tide-200/60 dark:border-tide-800/40">
            <span className="w-2 h-2 rounded-full bg-tide-500 animate-pulse" />
            Live Broadcast Ready
          </div>
        </div>
      </div>

      {/* Template Selector */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
              Email Template
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Select a pre-designed responsive template or craft custom HTML.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(TEMPLATES).map(([key, template]) => {
            const isSelected = formData.template === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => applyTemplate(key)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-tide-500 bg-tide-50/70 dark:bg-tide-900/20 ring-1 ring-tide-500"
                    : "border-gray-200/80 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900"
                }`}
              >
                <div>
                  <div className="text-2xl mb-1.5">{template.icon}</div>
                  <div className="font-bold text-xs text-gray-900 dark:text-gray-100 line-clamp-1">
                    {template.name}
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-tight">
                  {template.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Template Variables (Only for structured templates) */}
      {formData.template !== "custom" && currentTemplate && (
        <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Template Variables
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Customize placeholders to dynamically populate the email template.
              </p>
            </div>
            <span className="text-xs text-tide-700 dark:text-tide-300 bg-tide-50 dark:bg-tide-900/30 border border-tide-200/60 dark:border-tide-800/40 px-2.5 py-1 rounded-full font-medium">
              Live Preview Linked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from(new Set(currentTemplate.body.match(/\{[^}]+\}/g) || []))
              .map((match) => match.slice(1, -1))
              .filter((varName) => varName !== "username")
              .map((varName) => {
                const isMultiLine = ["bullets", "highlights", "description", "new_features"].includes(varName);
                return (
                  <div key={varName} className={isMultiLine ? "md:col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 capitalize">
                      {varName.replace(/_/g, " ")}
                    </label>
                    {isMultiLine ? (
                      <textarea
                        name={varName}
                        value={formData[varName] || ""}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/60 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-tide-500 outline-none resize-y"
                        placeholder={`Enter ${varName.replace(/_/g, " ")}`}
                      />
                    ) : (
                      <input
                        type="text"
                        name={varName}
                        value={formData[varName] || ""}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-800/60 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-tide-500 outline-none"
                        placeholder={`Enter ${varName.replace(/_/g, " ")}`}
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Broadcast Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Email Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-tide-500 outline-none disabled:opacity-50"
                placeholder="Enter subject line"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Sender Name
              </label>
              <input
                type="text"
                name="sender_name"
                value={formData.sender_name}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-tide-500 outline-none disabled:opacity-50"
                placeholder="VibeFlow Team (default)"
              />
            </div>
          </div>

          {/* Email Preview & Code Toggle */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Email Template Layout
              </label>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewTab("preview")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewTab === "preview"
                      ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Interactive Preview
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("code")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    previewTab === "code"
                      ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  HTML Source Code
                </button>
              </div>
            </div>

            {previewTab === "preview" ? (
              <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 overflow-hidden bg-gray-100 dark:bg-zinc-950">
                {/* Simulated Email Envelope Bar */}
                <div className="px-4 py-3 bg-white dark:bg-zinc-900 border-b border-gray-200/80 dark:border-zinc-800 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-400 dark:text-zinc-500 w-14">From:</span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {formData.sender_name || "VibeFlow Team"} &lt;notifications@vibeflow.app&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-400 dark:text-zinc-500 w-14">To:</span>
                    <span className="text-gray-800 dark:text-gray-200">
                      Alex &lt;alex@creator.io&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-400 dark:text-zinc-500 w-14">Subject:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {previewSubject}
                    </span>
                  </div>
                </div>

                {/* Rendered Email Canvas */}
                <div className="p-4 sm:p-8 overflow-x-auto flex justify-center">
                  <div
                    className="w-full max-w-[700px] transition-all"
                    dangerouslySetInnerHTML={{ __html: previewBody }}
                  />
                </div>
              </div>
            ) : (
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                required
                disabled={isLoading}
                rows={14}
                className="w-full p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50/70 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 font-mono text-xs focus:ring-2 focus:ring-tide-500 outline-none resize-y"
                placeholder="Enter HTML template with {placeholders}..."
              />
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Emails will be sent with verified DKIM & SPF signatures.
            </p>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-tide-600 text-white rounded-xl font-bold text-sm hover:bg-tide-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tide-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sending Broadcast...</span>
                </>
              ) : (
                <>
                  <span>Send Broadcast Email</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Verification Reminders Action Card */}
        <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Email Verification Reminders
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                Automatically remind registered users who haven't verified their email yet. Improves inbox deliverability and security.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSendVerificationReminders}
              disabled={isLoading || verificationState === STATES.SENDING}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 shrink-0"
            >
              {verificationState === STATES.SENDING ? "Sending Reminders..." : "Send Verification Reminders"}
            </button>
          </div>

          {verificationState === STATES.SUCCESS && verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/60 rounded-xl text-xs text-green-800 dark:text-green-300 font-medium"
            >
              Verification reminders sent successfully to {verificationResult.sent} of {verificationResult.total} unverified users.
            </motion.div>
          )}

          {verificationState === STATES.ERROR && verificationError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/60 rounded-xl text-xs text-red-800 dark:text-red-300 font-medium"
            >
              {verificationError}
            </motion.div>
          )}
        </div>
      </form>

      {/* Broadcast Result Banners */}
      {state === STATES.SUCCESS && result && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/60 rounded-2xl text-sm text-green-800 dark:text-green-300 font-semibold"
        >
          Broadcast dispatched! Successfully sent to {result.sent} of {result.total} users.
        </motion.div>
      )}

      {state === STATES.ERROR && error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/60 rounded-2xl text-sm text-red-800 dark:text-red-300 font-semibold"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
