import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../lib/api';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function Login() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!codeSent || resendTimer <= 0) return;
    const timer = window.setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [codeSent, resendTimer]);

  const handleSendCode = async () => {
    if (!email) {
      toast.error('Please enter your registered email.');
      return;
    }
    setSendingCode(true);
    try {
      await api.post('/auth/request-code', { email });
      toast.success('Login code sent. Check your email.');
      setCodeSent(true);
      setCode('');
      setResendTimer(RESEND_COOLDOWN);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send code');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeSent) {
      toast.error('Send the login code to your email first.');
      return;
    }
    if (code.length !== CODE_LENGTH) {
      toast.error('Enter the 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      await login(email, code);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid code, try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fury-black via-gray-900 to-fury-black">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.jpg" 
              alt="FuryRoad RC Club Logo" 
              className="w-32 h-32 object-contain drop-shadow-lg rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
              loading="eager"
            />
          </div>
          <h1 className="text-4xl font-bold text-fury-orange mb-2 tracking-tight">FuryRoad</h1>
          <p className="text-gray-300 font-semibold text-lg">RC Club</p>
          <p className="text-gray-400 text-sm mt-2 font-medium">Secure Email Code Login</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Registered Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field flex-1"
                placeholder="you@example.com"
                required
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode || !email || resendTimer > 0}
                className="btn-secondary whitespace-nowrap disabled:opacity-50"
              >
                {sendingCode
                  ? 'Sending...'
                  : resendTimer > 0
                  ? `Resend in ${resendTimer}s`
                  : codeSent
                  ? 'Resend Code'
                  : 'Send Code'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              We’ll email a one-time login code to this address.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              6-digit Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH))}
              className="input-field tracking-[0.5rem] text-center text-lg"
              placeholder="••••••"
              disabled={!codeSent}
            />
            {!codeSent && (
              <p className="text-xs text-gray-500 mt-2">
                Send a code to your email to enable this field.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !codeSent || code.length !== CODE_LENGTH}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

