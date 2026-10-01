import {
  Sidebar,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
  SidebarScrollWrapper,
  SidebarSpace,
} from '@backstage/core-components';
import { NavContentBlueprint } from '@backstage/plugin-app-react';
import { SidebarLogo } from './SidebarLogo';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import { SidebarSearchModal } from '@backstage/plugin-search';
import { UserSettingsSignInAvatar } from '@backstage/plugin-user-settings';
import { NotificationsSidebarItem } from '@backstage/plugin-notifications';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { textosHrl } from '../idioma';

export const SidebarContent = NavContentBlueprint.make({
  params: {
    component: ({ navItems }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks -- `component` se renderiza como componente de React.
      const { t } = useTranslationRef(textosHrl);
      // El título que trae cada página es texto fijo (app-config.yaml); aquí se
      // reemplaza por el traducido para que la barra cambie con el idioma. Una
      // página nueva sin entrada conserva su título original.
      const titulos: Record<string, string> = {
        'page:home': t('paginas.home'),
        'page:catalog': t('paginas.catalog'),
        'page:scaffolder': t('paginas.scaffolder'),
        'page:api-docs': t('paginas.api-docs'),
        'page:catalog-graph': t('paginas.catalog-graph'),
        'page:techdocs': t('paginas.techdocs'),
        'page:catalog-import': t('paginas.catalog-import'),
        'page:app-visualizer': t('paginas.app-visualizer'),
        'page:user-settings': t('paginas.user-settings'),
      };
      const nav = navItems.withComponent(item => (
        <SidebarItem
          icon={() => item.icon}
          to={item.href}
          text={titulos[item.node.spec.id] ?? item.title}
        />
      ));

      // Skipped items
      nav.take('page:search'); // Using search modal instead
      nav.take('page:notifications'); // Using NotificationsSidebarItem manually instead

      return (
        <Sidebar>
          <SidebarLogo />
          <SidebarGroup
            label={t('barra.search')}
            icon={<SearchIcon />}
            to="/search"
          >
            <SidebarSearchModal />
          </SidebarGroup>
          <SidebarDivider />
          <SidebarGroup label={t('barra.menu')} icon={<MenuIcon />}>
            {nav.take('page:home')}
            {nav.take('page:catalog')}
            {nav.take('page:scaffolder')}
            <SidebarDivider />
            <SidebarScrollWrapper>
              {nav.rest({ sortBy: 'title' })}
            </SidebarScrollWrapper>
          </SidebarGroup>
          <SidebarSpace />
          <SidebarDivider />
          <NotificationsSidebarItem text={t('paginas.notifications')} />
          <SidebarDivider />
          <SidebarGroup
            label={t('barra.settings')}
            icon={<UserSettingsSignInAvatar />}
            to="/settings"
          >
            {nav.take('page:app-visualizer')}
            {nav.take('page:user-settings')}
          </SidebarGroup>
        </Sidebar>
      );
    },
  },
});
