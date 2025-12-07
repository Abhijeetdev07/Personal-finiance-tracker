import { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function FaceVerification({ onVerified }) {
  const webcamRef = useRef(null);
  const [webcamReady, setWebcamReady] = useState(false);
  const [verificationState, setVerificationState] = useState("IDLE");
  const [message, setMessage] = useState("Initializing verification...");
  const [progress, setProgress] = useState(0);
 
  // Auto-verify after camera loads (mock verification for testing)
  useEffect(() => {
    if (webcamReady && verificationState === "IDLE") {
      setVerificationState("DETECTING");
      setMessage("Look at the camera");
      setProgress(30);

      // Auto-complete after 3 seconds
      const timer = setTimeout(() => {
        setProgress(100);
        setMessage("Verification Complete!");
        setVerificationState("SUCCESS");
        console.log('✅ Auto-verification completed!');
        onVerified();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [webcamReady, verificationState, onVerified]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-900 rounded-2xl w-full max-w-md mx-auto shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-6 tracking-wide">Liveness Verification</h3>
      
      {/* Oval Container with Circular Progress */}
      <div className="relative">
        {/* SVG Circular Progress Border */}
        <svg 
          className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]" 
          viewBox="0 0 304 400"
        >
          <ellipse
            cx="152"
            cy="200"
            rx="142"
            ry="190"
            fill="none"
            stroke="#1f2937"
            strokeWidth="8"
          />
          <ellipse
            cx="152"
            cy="200"
            rx="142"
            ry="190"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${Math.PI * 2 * 166}`}
            strokeDashoffset={`${Math.PI * 2 * 166 * (1 - progress / 100)}`}
            className="transition-all duration-500"
            style={{ 
              filter: 'drop-shadow(0 0 8px #22d3ee)',
              transform: 'rotate(-90deg)',
              transformOrigin: 'center'
            }}
          />
        </svg>

        <div className="relative w-72 h-96 rounded-[50%] overflow-hidden bg-black">
          {!webcamReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-30">
              <FaSpinner className="animate-spin text-5xl text-cyan-400 mb-3" />
              <p className="text-cyan-200 text-sm font-medium">Starting camera...</p>
            </div>
          )}
          
          {verificationState === "SUCCESS" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/90 z-30 backdrop-blur-sm">
              <FaCheckCircle className="text-7xl text-white mb-3 animate-bounce" />
              <p className="text-white text-2xl font-bold">Verified!</p>
            </div>
          )}

          <Webcam
            ref={webcamRef}
            audio={false}
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
            screenshotFormat="image/jpeg"
            onUserMedia={() => setWebcamReady(true)}
            videoConstraints={{
              width: 480,
              height: 640,
              facingMode: "user"
            }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center min-h-[4rem] flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-cyan-100 px-4 mb-1">
          {message}
        </p>
        {verificationState === "DETECTING" && (
          <p className="text-sm text-gray-400">Verifying...</p>
        )}
      </div>
    </div>
  );
}
