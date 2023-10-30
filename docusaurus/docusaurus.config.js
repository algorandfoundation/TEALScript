// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  plugins: [
    [
      'docusaurus-plugin-typedoc',

      // Plugin / TypeDoc options
      {
        tsconfig: '../tsconfig.json',
        // entryPoints: ['../types/global.d.ts', '../src/lib/index.ts'],
        excludeInternal: true,
        plugin: ['typedoc-plugin-merge-modules'],
      },
    ],
  ],
  title: 'TEALScript',
  tagline: 'Algorand Smart Contracts in TypeScript',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://your-docusaurus-test-site.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'algorandfoundation', // Usually your GitHub org/user name.
  projectName: 'tealscript', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'TEALScript',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'api',
            position: 'left',
            label: 'API Documentation',
          },
          {
            type: 'docSidebar',
            sidebarId: 'guides',
            label: 'Guides',
            position: 'left',
          },
          {
            type: 'dropdown',
            label: 'Tutorials',
            items: [
              {
                type: 'docSidebar',
                sidebarId: 'helloWorld',
                label: 'Hello World',
              },
            ],
          },
          {
            href: 'https://github.com/algorandfoundation/tealscript',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/algorand',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/algodevs',
              },
              {
                label: 'Algorand Forum',
                href: 'https://forum.algorand.org',
              },
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'Developer Portal',
                href: 'https://developer.algorand.org',
              },
              {
                label: 'AlgoDevs YouTube',
                href: 'https://www.youtube.com/@algodevs',
              },
              {
                label: 'Bootcamps',
                href: 'https://github.com/algorand-bootcamp',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Algokit CLI',
                href: 'https://github.com/algorandfoundation/algokit-cli',
              },
            ],
          },
        ],
        // copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
