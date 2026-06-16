import { Link, useParams } from "react-router-dom";
import { getMockOrderById } from "../../data/mockOrders";

function OrderDetailPage() {
  const { orderId } = useParams();
  const id = orderId ? decodeURIComponent(orderId) : "";
  const order = id ? getMockOrderById(id) : null;

  if (!order) {
    return (
      <div className="rounded-2xl border border-white/10 bg-(--soft-black)/60 p-8 text-center">
        <p className="text-(--gray-light)">Order not found.</p>
        <Link
          to="/account/orders"
          className="mt-4 inline-block text-sm font-medium text-(--gold-light) hover:text-(--gold)"
        >
          ← Back to order history
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/account/orders"
        className="text-xs font-medium text-(--gold-light) transition hover:text-(--gold)"
      >
        ← Order history
      </Link>

      <div className="mt-6 rounded-2xl border border-white/10 bg-(--soft-black)/60 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-(--white)">{order.id}</h2>
            <p className="mt-1 text-sm text-(--gray-light)">
              Placed on {order.date} · <span className="text-(--cream)">{order.status}</span>
            </p>
          </div>
          <p className="text-lg font-bold text-(--gold)">Rs {order.total}</p>
        </div>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-(--gold-light)">Items</h3>
        <ul className="mt-3 divide-y divide-white/10">
          {order.items.map((line, i) => (
            <li key={`${line.name}-${i}`} className="flex justify-between gap-4 py-3 text-sm">
              <span className="text-(--cream)">
                {line.name}
                {line.qty > 1 ? <span className="text-(--gray)"> ×{line.qty}</span> : null}
              </span>
              <span className="shrink-0 font-medium text-(--gold)">Rs {line.lineTotal}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default OrderDetailPage;
