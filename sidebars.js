/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
    // By default, Docusaurus generates a sidebar from the docs folder structure
    tutorialSidebar: [
        'index', // Overview
        {
            type: 'category',
            label: 'Inference Gateway',
            link: {
                type: 'doc',
                id: 'inference-gateway/index',
            },
            collapsed: false,
            items: [
                'inference-gateway/architecture',
                'inference-gateway/prompt-compression',
                'inference-gateway/context-deduplication',
                'inference-gateway/semantic-cache',
                'inference-gateway/intelligent-routing',
                'inference-gateway/pii-redaction',
                'inference-gateway/auto-failover',
                'inference-gateway/api-reference',
                'inference-gateway/benchmarks',
                'inference-gateway/comparisons',
            ],
        },
    ],
};

module.exports = sidebars;
