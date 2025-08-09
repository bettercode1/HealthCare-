import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <span className="material-icons text-3xl mr-2" style={{ color: 'hsl(207, 90%, 54%)' }}>local_hospital</span>
              <span className="text-xl font-bold">{t('healthcarePro')}</span>
            </div>
            <p className="text-gray-300 mb-4">
              {t('footerDescription')}
            </p>
            <div className="flex space-x-4">
              <button className="text-gray-300 hover:text-white transition-colors">
                <span className="material-icons">facebook</span>
              </button>
              <button className="text-gray-300 hover:text-white transition-colors">
                <span className="material-icons">link</span>
              </button>
              <button className="text-gray-300 hover:text-white transition-colors">
                <span className="material-icons">email</span>
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('company')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t('about')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t('contact')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t('careers')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t('blog')}</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('legal')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t('privacyPolicy')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t('termsOfUse')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t('security')}</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">{t('hipaaCompliance')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-300">{t('copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
