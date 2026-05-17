<?php

declare(strict_types=1);

use App\Controllers\ArticleController;
use App\Controllers\AuthController;
use App\Controllers\CommentController;
use App\Controllers\CommunityController;
use App\Controllers\EventController;
use App\Controllers\ResourceController;

return [
    'GET /api/health' => [AuthController::class, 'health'],

    // Person 1: Auth
    'POST /api/auth/register' => [AuthController::class, 'register'],
    'POST /api/auth/login' => [AuthController::class, 'login'],
    'POST /api/auth/logout' => [AuthController::class, 'logout'],
    'POST /api/auth/refresh' => [AuthController::class, 'refresh'],
    'GET /api/auth/me' => [AuthController::class, 'me'],
    'PUT /api/auth/profile' => [AuthController::class, 'updateProfile'],
    'GET /api/auth/settings' => [AuthController::class, 'settings'],
    'PUT /api/auth/settings' => [AuthController::class, 'updateSettings'],
    'POST /api/newsletter/subscribe' => [AuthController::class, 'subscribeNewsletter'],
    'GET /api/stats' => [AuthController::class, 'siteStats'],

    // Person 2: Articles
    'GET /api/articles' => [ArticleController::class, 'index'],
    'GET /api/articles/{id}' => [ArticleController::class, 'show'],
    'GET /api/articles/slug/{slug}' => [ArticleController::class, 'showBySlug'],
    'GET /api/categories' => [ArticleController::class, 'categories'],
    'GET /api/tags' => [ArticleController::class, 'tags'],
    'POST /api/articles' => [ArticleController::class, 'store'],
    'PUT /api/articles/{id}' => [ArticleController::class, 'update'],
    'DELETE /api/articles/{id}' => [ArticleController::class, 'destroy'],
    'GET /api/articles/search' => [ArticleController::class, 'search'],

    // Person 3: Post interactions
    'POST /api/articles/{id}/like' => [CommentController::class, 'likeArticle'],
    'DELETE /api/articles/{id}/like' => [CommentController::class, 'unlikeArticle'],
    'POST /api/articles/{id}/bookmark' => [CommentController::class, 'bookmarkArticle'],
    'DELETE /api/articles/{id}/bookmark' => [CommentController::class, 'removeBookmark'],
    'GET /api/articles/{id}/comments' => [CommentController::class, 'articleComments'],
    'POST /api/articles/{id}/comments' => [CommentController::class, 'storeArticleComment'],
    'PUT /api/comments/{id}' => [CommentController::class, 'updateComment'],
    'DELETE /api/comments/{id}' => [CommentController::class, 'deleteComment'],
    'POST /api/comments/{id}/like' => [CommentController::class, 'likeComment'],

    // Person 4: Community
    'GET /api/users' => [CommunityController::class, 'users'],
    'GET /api/users/{id}' => [CommunityController::class, 'showUser'],
    'GET /api/users/search' => [CommunityController::class, 'searchUsers'],
    'POST /api/mentorship/request' => [CommunityController::class, 'requestMentorship'],
    'GET /api/mentorship/matches' => [CommunityController::class, 'mentorshipMatches'],
    'GET /api/forum/topics' => [CommunityController::class, 'forumTopics'],
    'POST /api/forum/topics' => [CommunityController::class, 'storeForumTopic'],
    'GET /api/forum/topics/{id}/replies' => [CommunityController::class, 'forumReplies'],
    'POST /api/forum/topics/{id}/replies' => [CommunityController::class, 'storeForumReply'],
    'PUT /api/forum/replies/{id}' => [CommunityController::class, 'updateForumReply'],

    // Person 5: Events
    'GET /api/events' => [EventController::class, 'index'],
    'GET /api/events/{id}' => [EventController::class, 'show'],
    'GET /api/events/calendar' => [EventController::class, 'calendar'],
    'POST /api/events' => [EventController::class, 'store'],
    'PUT /api/events/{id}' => [EventController::class, 'update'],
    'DELETE /api/events/{id}' => [EventController::class, 'destroy'],
    'POST /api/events/{id}/rsvp' => [EventController::class, 'rsvp'],
    'DELETE /api/events/{id}/rsvp' => [EventController::class, 'cancelRsvp'],
    'GET /api/events/{id}/attendees' => [EventController::class, 'attendees'],
    'POST /api/events/{id}/reminder' => [EventController::class, 'setReminder'],

    // Person 6: Resources and contact
    'GET /api/resources' => [ResourceController::class, 'index'],
    'GET /api/resources/{id}/download' => [ResourceController::class, 'download'],
    'POST /api/resources/{id}/rate' => [ResourceController::class, 'rate'],
    'GET /api/resources/learning-paths' => [ResourceController::class, 'learningPaths'],
    'POST /api/resources/progress' => [ResourceController::class, 'saveProgress'],
    'POST /api/contact' => [ResourceController::class, 'contact'],
    'GET /api/contact/messages' => [ResourceController::class, 'contactMessages'],
];
