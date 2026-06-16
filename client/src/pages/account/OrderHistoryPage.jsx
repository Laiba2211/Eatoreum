import { Link } from "react-router-dom";
import { mockOrders } from "../../data/mockOrders";

function OrderHistoryPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-(--white)">Order history</h2>
      <p className="mt-1 text-sm text-(--gray-light)">Demo orders — replace with your API.</p>

      <ul className="mt-8 space-y-3">
        {mockOrders.map((o) => (
          <li key={o.id}>
            <Link
              to={`/account/orders/${encodeURIComponent(o.id)}`}
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-(--soft-black)/60 p-4 transition hover:border-(--gold)/30 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-(--cream)">{o.id}</p>
                <p className="text-xs text-(--gray)">
                  {o.date} · {o.itemCount} items · {o.status}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="text-sm font-bold text-(--gold)">Rs {o.total}</span>
                <span className="text-xs font-medium text-(--gold-light)">View →</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OrderHistoryPage;
