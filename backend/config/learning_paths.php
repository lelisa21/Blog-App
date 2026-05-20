<?php

declare(strict_types=1);

/**
 * Learning path definitions keyed by slug.
 * Each path maps to a resources.category value: learning-path-{slug}
 */
return [
    'web' => [
        'title' => 'Ethiopian Web Developer',
        'estimate' => '6-12 months',
        'category' => 'learning-path-web',
        'steps' => [
            'HTML/CSS/JS Basics (freeCodeCamp – offline)',
            'React.js (most in-demand in Addis jobs)',
            'Node.js/Express backend',
            'Deploy on local hosts (HahuCloud/Yegara)',
            'Integrate payments (Chapa, HelloCash)',
            'Amharic localization & offline support',
        ],
        'default_progress' => 30,
    ],
    'mobile' => [
        'title' => 'Mobile App Developer',
        'estimate' => '8-14 months',
        'category' => 'learning-path-mobile',
        'steps' => [
            'Flutter (cross-platform, low data usage)',
            'Android focus (90%+ market share)',
            'Offline-first architecture',
            "Amharic/Ge'ez script support",
            'Publish on local app stores',
        ],
        'default_progress' => 20,
    ],
    'ai' => [
        'title' => 'AI & Data Science Track',
        'estimate' => '9-15 months',
        'category' => 'learning-path-ai',
        'steps' => [
            'Python basics (Anaconda offline)',
            'ML with Google Colab (low bandwidth)',
            'Local apps: AgriTech, Amharic NLP',
            'Ethiopian AI Institute projects',
        ],
        'default_progress' => 25,
    ],
];
