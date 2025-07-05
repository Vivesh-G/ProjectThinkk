export default function WelcomeScreen() {
  const features = [
    {
      title: "Reflection Mode",
      description: "Guides you to think through complex topics with questions.",
    },
    {
      title: "Answer Mode",
      description: "Provides direct, concise answers to your questions.",
    },
    {
      title: "Get Help with LeetCode",
      description: "Help me with this leetcode problem...",
    },
    {
      title: "Devise a Learning Plan",
      description: "Help me devise a learning plan for...",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="relative mb-8">
        <h1 className="text-5xl sm:text-8xl font-bold tracking-wide text-center mb-4 bg-gradient-to-b from-white to-black text-transparent bg-clip-text">
          #ProjectThinkk
        </h1>
        <p className="text-gray-400 text-center text-lg typewriter-text">
          Fire up the Neurons in your Brain
        </p>
      </div>

      {/* Feature boxes */}
      <div className="w-full max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 font-mono">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className="bg-transparent border border-white/50 rounded-md p-3 h-full animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <h3 className="font-bold text-white mb-2 text-sm">
              {feature.title}
            </h3>
            <p className="text-white text-xs">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}