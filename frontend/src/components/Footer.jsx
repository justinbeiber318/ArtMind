import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      style={{
        background: '#040404',
        color: 'var(--muted)',
        marginTop: 80,
        borderTop: '1px solid var(--border)',
      }}
    >
      <div
        className="container"
        style={{
          padding: '56px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 32,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--dark-gray)',
              fontSize: '1.2rem',
              marginBottom: 12,
              letterSpacing: '0.08em',
            }}
          >
            AURELIS
          </div>

          <p style={{ fontSize: '0.85rem', maxWidth: 260 }}>
            {t('footer_description')}
          </p>
        </div>

        <div>
          <h4
            style={{
              color: 'var(--navy)',
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            {t('explore')}
          </h4>

          <ul
            style={{
              listStyle: 'none',
              fontSize: '0.88rem',
              lineHeight: 2,
            }}
          >
            <li>
              <Link to="/gallery">{t('gallery')}</Link>
            </li>

            <li>
              <Link to="/ai-search">{t('ai_search')}</Link>
            </li>

            <li>
              <Link to="/ai-recognition">{t('recognition')}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4
            style={{
              color: 'var(--navy)',
              fontSize: '0.8rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            {t('account')}
          </h4>

          <ul
            style={{
              listStyle: 'none',
              fontSize: '0.88rem',
              lineHeight: 2,
            }}
          >
            <li>
              <Link to="/login">{t('sign_in')}</Link>
            </li>

            <li>
              <Link to="/register">{t('create_account')}</Link>
            </li>

            <li>
              <Link to="/dashboard">{t('dashboard')}</Link>
            </li>
          </ul>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--border)',
          padding: '20px 0',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--muted)',
        }}
      >
        © {new Date().getFullYear()} Aurelis. {t('footer_copyright')}
      </div>
    </footer>
  );
}