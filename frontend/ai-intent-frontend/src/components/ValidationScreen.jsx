import { CheckCircle } from 'lucide-react';

export default function ValidationScreen({ onContinue }) {
  return (
    <div className="w-full max-w-md text-center">
      <div className="mb-10">
        <h2 className="text-5xl font-bold mb-2">Validation</h2>
        <p className="text-white/70">AI has reviewed your application</p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 space-y-6 border border-white/20">
        <div className="flex items-center gap-4 text-left">
          <CheckCircle className="w-10 h-10 text-green-400" />
          <div>
            <p className="font-semibold">Security Checks Passed</p>
            <p className="text-sm text-white/60">OAuth, encryption, and input validation verified</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-left">
          <CheckCircle className="w-10 h-10 text-green-400" />
          <div>
            <p className="font-semibold">Compliance Verified</p>
            <p className="text-sm text-white/60">HIPAA / GDPR style checks completed</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-left">
          <CheckCircle className="w-10 h-10 text-green-400" />
          <div>
            <p className="font-semibold">Test Cases Passed</p>
            <p className="text-sm text-white/60">Unit & integration tests auto-generated</p>
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="mt-10 w-full py-5 bg-white text-purple-900 font-semibold rounded-2xl hover:bg-white/90 transition"
      >
        Continue to Output
      </button>
    </div>
  );
}