import '@backstage/cli/asset-types';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@backstage/ui/css/styles.css';
// Después de los de BUI: los reemplaza con la paleta del portal.
import './modules/tema/tokens.css';

ReactDOM.createRoot(document.getElementById('root')!).render(App.createRoot());
