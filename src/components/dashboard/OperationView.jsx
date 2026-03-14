import { useEffect, useState } from "react";
import { Row, Col, Card, Badge, Spinner, Button } from "react-bootstrap";

export default function OperationView() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API Pública de Notícias Espaciais e Tecnológicas (Sem Token necessário)
    fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=12')
      .then(res => res.json())
      .then(data => {
        setNews(data.results || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar notícias:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5" style={{ minHeight: '300px' }}>
        <Spinner animation="grow" variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-2 animate-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="text-white mb-1">Operações de Monitoramento</h4>
          <p className="text-secondary small">Feed global de tecnologia e infraestrutura</p>
        </div>
        <Badge bg="success" className="p-2 shadow-sm">SISTEMA ONLINE</Badge>
      </div>

      <Row className="g-4">
        {news.map((item) => (
          <Col key={item.id} md={6} lg={4} xl={3}>
            <Card className="h-100 bg-dark border-secondary text-white card-hover-effect">
              <div className="position-relative">
                <Card.Img 
                  variant="top" 
                  src={item.image_url} 
                  style={{ height: '160px', objectFit: 'cover' }} 
                />
                <Badge 
                  bg="primary" 
                  className="position-absolute top-0 start-0 m-2"
                  style={{ fontSize: '0.65rem' }}
                >
                  {item.news_site}
                </Badge>
              </div>
              
              <Card.Body className="d-flex flex-column p-3">
                <Card.Title style={{ fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.4' }}>
                  {item.title}
                </Card.Title>
                
                <Card.Text className="text-secondary small flex-grow-1" style={{ fontSize: '0.8rem' }}>
                  {item.summary ? item.summary.substring(0, 90) + "..." : "Monitoramento em tempo real..."}
                </Card.Text>

                <div className="mt-3 pt-3 border-top border-secondary d-flex justify-content-between align-items-center">
                  <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {new Date(item.published_at).toLocaleDateString()}
                  </span>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 text-decoration-none text-primary fw-bold"
                    href={item.url} 
                    target="_blank"
                  >
                    DETALHES <i className="bi bi-arrow-right"></i>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <style>{`
        .card-hover-effect {
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .card-hover-effect:hover {
          transform: translateY(-5px);
          border-color: #6f42c1 !important;
          box-shadow: 0 10px 20px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
}