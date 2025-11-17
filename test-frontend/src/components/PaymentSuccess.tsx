import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const tracker = searchParams.get('tracker');

    if (tracker) {
      fetch(`http://localhost:8000/api/v1/payments/status/${tracker}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || 'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zNGVrcFdOemE4OFBhSlo4eTY1QVk5NzZDeXUiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL3BsYXRmb3JtLmxhdW5jaGl4LmFpIiwiZXhwIjoxNzYzMzYzOTA1LCJmdmEiOls3MTY3LC0xXSwiaWF0IjoxNzYzMzYzODQ1LCJpc3MiOiJodHRwczovL2NsZXJrLmxhdW5jaGl4LmFpIiwibmJmIjoxNzYzMzYzODM1LCJzaWQiOiJzZXNzXzM1TXhXTGU1aTJXd1B0NjhrNHVzNEQzTVRpbSIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMzRwaFV3YTltSlc4QjFXQmd3Ym90VFZUWVhOIiwidiI6Mn0.VbGKFpDMsXwNHCmiXsDLv5gSLgPLwmCYA9m6kcA6RivOqMSlyJG_cz7wkIeo02Ufvw84ZWfUrbVRLsoZZCu2p0Sty_VGg8rO35tpK3VFoTnf-GO4OYV-CY9qvidoa-ByBkY4eK-zh71H_YxJs0EGpoUqJlLATcAyMhdaiZb4nm34TvbBktJiN6glsBWsrO285hHD4gwglGCSnwaS1_HQOKnrsJDQmlCWigBj2TVpaBwt8TnIXTI-7oWLHtGi8vE1FnZrg84h4CCyjz0hbhT_0rQ3hi0IgFW-LiPbGMlR8VK6z9-O8WwfkZinFlK074qRMy3E3c2KqbtPAHj4tS-LwA'}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('data', data);

          if (data.tracker.state === 'TRACKER_ENDED') {
            setStatus('success');
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
          } else {
            setStatus('failed');
          }
        })
        .catch(() => setStatus('error'));
    }
  }, [searchParams]);

  return (
    <div className="p-6 text-center">
      {status === 'checking' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Verifying Payment...</h2>
          <p>Please wait while we confirm your payment.</p>
        </div>
      )}
      {status === 'success' && (
        <div className="text-green-600">
          <h2 className="text-xl font-bold mb-4">Payment Successful!</h2>
          <p>Your subscription has been activated. Redirecting...</p>
        </div>
      )}
      {status === 'failed' && (
        <div className="text-red-600">
          <h2 className="text-xl font-bold mb-4">Payment Failed</h2>
          <p>There was an issue with your payment. Please try again.</p>
          <button
            onClick={() => (window.location.href = '/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Back to Plans
          </button>
        </div>
      )}
    </div>
  );
}
