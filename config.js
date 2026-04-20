// Configuration for the Portfolio AI Chatbot
// The GEMINI_API_KEY will be injected via CI/CD (GitHub Actions) or environment variables before deployment.
// Using a global config object to hold environment variables for the frontend.
window.ENV = {
    GEMINI_API_KEY: "REPLACEME_GEMINI_API_KEY"
};
