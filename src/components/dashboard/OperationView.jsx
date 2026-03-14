import { useEffect, useState } from "react";
import { Table, Spinner } from "react-bootstrap";

export default function OperationView() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API Pública da CoinGecko - Lista de Preços em tempo real
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1')
      .then(res => res.json())
      .then(data => {
        setCoins(data);
        setLoading(false);
      })
      .catch(err => console.error("Erro na API:", err));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-2 animate-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="text-white mb-0">Painel de Operações de Mercado</h4>
        <span className="badge bg-primary">Live Data</span>
      </div>

      <Table responsive hover className="custom-table">
        <thead>
          <tr>
            <th>Ativo</th>
            <th>Preço (USD)</th>
            <th>24h %</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => (
            <tr key={coin.id}>
              <td>
                <div className="d-flex align-items-center">
                  <img src={coin.image} alt={coin.name} width="24" className="me-2" />
                  <span className="fw-bold text-white">{coin.symbol.toUpperCase()}</span>
                </div>
              </td>
              <td className="text-white">
                ${coin.current_price.toLocaleString()}
              </td>
              <td>
                <span style={{ color: coin.price_change_percentage_24h > 0 ? '#00ff88' : '#ff4d4d' }}>
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </span>
              </td>
              <td className="text-secondary">
                ${coin.total_volume.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}