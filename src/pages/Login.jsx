import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'; // Importações do Bootstrap
import api from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Manteve a lógica de Token do Google intacta
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('@AxionID:token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      api.get('/api/v1/me')
        .then(res => {
          const user = res.data;
          const role = (user.is_admin === 1 || user.is_admin === true) ? 'admin' : 'user';
          localStorage.setItem('@AxionID:role', role);
          window.history.replaceState({}, document.title, "/login");
          navigate('/dashboard', { replace: true });
        })
        .catch(err => {
          console.error("Erro ao buscar perfil do Google login", err);
          navigate('/login', { replace: true });
        });
    }
  }, [navigate]);

  // Manteve a lógica de Login Manual intacta
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/v1/login', { username, password });
      const { token, user } = response.data;
      
      localStorage.setItem('@AxionID:token', token);
      const role = (user.is_admin === 1 || user.is_admin === true) ? 'admin' : 'user';
      localStorage.setItem('@AxionID:role', role);

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError('Usuário ou senha incorretos.');
      console.error("Erro no login manual", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const origin = window.location.origin;
    window.location.href = `http://163.176.168.224/api/v1/auth/google?origin=${origin}`;
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card className="auth-card p-4 shadow-lg border-0" style={{ maxWidth: '420px', width: '100%', borderRadius: '15px' }}>
        <Card.Body>
          <div className="text-center mb-4">
            <h1 className="fw-bold" style={{ letterSpacing: '-1px' }}>
              Axion<span className="text-primary">ID</span>
            </h1>
          </div>

          {error && <Alert variant="danger" className="py-2 small text-center">{error}</Alert>}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label className="small fw-bold text-secondary text-uppercase">Identificação</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="CPF ou CNPJ" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                className="py-2"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Form.Label className="small fw-bold text-secondary text-uppercase mb-0">Senha</Form.Label>
              </div>
              <Form.Control 
                type="password" 
                placeholder="Sua senha" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required 
                className="py-2"
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 py-2 fw-bold mb-3" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Autenticando...
                </>
              ) : 'Acessar Painel'}
            </Button>

            <div className="d-flex align-items-center my-3 text-muted small">
              <hr className="flex-grow-1" />
              <span className="mx-2">ou continue com</span>
              <hr className="flex-grow-1" />
            </div>
            
            <Button 
              variant="outline-dark" 
              className="w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-3" 
              onClick={handleGoogleLogin}
              style={{ borderColor: '#dee2e6' }}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" /> 
              Google Workspace
            </Button>

            <div className="text-center">
              <Link to="/forgot-password" size="small" className="text-decoration-none small">
                Esqueceu sua senha?
              </Link>
            </div>
          </Form>

          <hr className="mt-4 mb-3 text-muted" />

          <div className="text-center small">
            <p className="mb-0 text-secondary">
              Ainda não tem acesso? <Link to="/register" className="fw-bold text-primary text-decoration-none">Criar Conta AxionID</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}