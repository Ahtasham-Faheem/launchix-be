import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@sfpy/atoms/styles';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentCancel from './components/PaymentCancel';

function Home() {
  const [plans, setPlans] = React.useState<any[]>([]);

  React.useEffect(() => {
    setPlans([
      {
        _id: { $oid: '69131234eea59196ac198b9b' },
        code: 'starter',
        name: 'Starter Plan',
        description: 'Perfect for getting started',
        currency: 'pkr',
        amount: 900,
        interval: 'month',
        intervalCount: 1,
        maxBrands: 2,
        features: ['2 brand identities', 'Logo generation'],
        isPopular: false,
        isActive: true,
        safepayPlanId: 'plan_c55a0060-6543-4332-a111-8939d4d9a393',
        createdAt: { $date: '2025-11-11T10:38:44.221Z' },
        updatedAt: { $date: '2025-11-11T10:38:44.221Z' },
        __v: 0,
      },
    ]);
  }, []);

  const handlePayment = async (planId: string) => {
    try {
      const response = await fetch(
        'http://localhost:8000/api/v1/payments/subscription/charge',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || 'eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zNGVrcFdOemE4OFBhSlo4eTY1QVk5NzZDeXUiLCJ0eXAiOiJKV1QifQ.eyJhenAiOiJodHRwczovL3BsYXRmb3JtLmxhdW5jaGl4LmFpIiwiZXhwIjoxNzYzMzYzOTA1LCJmdmEiOls3MTY3LC0xXSwiaWF0IjoxNzYzMzYzODQ1LCJpc3MiOiJodHRwczovL2NsZXJrLmxhdW5jaGl4LmFpIiwibmJmIjoxNzYzMzYzODM1LCJzaWQiOiJzZXNzXzM1TXhXTGU1aTJXd1B0NjhrNHVzNEQzTVRpbSIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMzRwaFV3YTltSlc4QjFXQmd3Ym90VFZUWVhOIiwidiI6Mn0.VbGKFpDMsXwNHCmiXsDLv5gSLgPLwmCYA9m6kcA6RivOqMSlyJG_cz7wkIeo02Ufvw84ZWfUrbVRLsoZZCu2p0Sty_VGg8rO35tpK3VFoTnf-GO4OYV-CY9qvidoa-ByBkY4eK-zh71H_YxJs0EGpoUqJlLATcAyMhdaiZb4nm34TvbBktJiN6glsBWsrO285hHD4gwglGCSnwaS1_HQOKnrsJDQmlCWigBj2TVpaBwt8TnIXTI-7oWLHtGi8vE1FnZrg84h4CCyjz0hbhT_0rQ3hi0IgFW-LiPbGMlR8VK6z9-O8WwfkZinFlK074qRMy3E3c2KqbtPAHj4tS-LwA'}`,
          },
          body: JSON.stringify({
            planId: planId,
          }),
        },
      );

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Choose Your Plan</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan._id} className="border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="mb-4">
              <span className="text-3xl font-bold">
                PKR: {plan.amount.toFixed(2)}
              </span>
              <span className="text-gray-500">/{plan.interval}</span>
            </div>
            <ul className="mb-6 space-y-2">
              {plan.features.map((feature: string, index: number) => (
                <li key={index} className="text-sm text-gray-600">
                  ✓ {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePayment(plan._id.$oid)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Upgrade
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
      </Routes>
    </Router>
  );
}
