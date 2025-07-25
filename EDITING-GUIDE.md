# Pizza Club Website - Editing Guide

This guide helps Pizza Club members update the website without needing technical knowledge.

## What You Can Edit

You can update three types of content:
1. **Events** - Add upcoming pizza nights, update details, or cancel events
2. **Members** - Update profile information, bios, or stats
3. **Restaurants** - Add new visits, update ratings, or add new restaurants

## Getting Started

1. **Get GitHub Access**
   - Create a free GitHub account at https://github.com
   - Ask Mike to add you as a collaborator to the pizza-club repository
   - Accept the invitation email from GitHub

2. **Find the Data Files**
   - Go to: https://github.com/[your-username]/pizza-club
   - Navigate to: `pizza-club-site/public/data/`
   - You'll see three files:
     - `events.json` - All events
     - `members.json` - Member profiles
     - `restaurants.json` - Restaurant visits and ratings

## How to Edit Files

### Step 1: Open the File
1. Click on the file you want to edit (e.g., `events.json`)
2. Click the pencil icon (✏️) in the top right that says "Edit this file"

### Step 2: Make Your Changes
The editor will open with the JSON content. Be careful to maintain the format!

### Step 3: Save Your Changes
1. Scroll down to "Commit changes"
2. Add a brief description (e.g., "Added March pizza night")
3. Keep "Commit directly to the main branch" selected
4. Click "Commit changes"

### Step 4: Wait for Deployment
- The website automatically updates in 3-5 minutes
- You'll receive an email if there are any errors

## Editing Examples

### Adding a New Event

Find the events array and add a new event at the beginning:

```json
{
  "id": "2025-05-pizza-night",
  "title": "May Pizza Night - Pequod's",
  "date": "2025-05-17T18:00:00",
  "location": "Pequod's Pizza",
  "address": "2207 N Clybourn Ave, Chicago, IL 60614",
  "description": "Back to Pequod's for that caramelized crust!",
  "maxAttendees": 10,
  "rsvpLink": null
}
```

### Updating Your Member Profile

Find your entry in `members.json` and update:

```json
{
  "id": "your-id",
  "name": "Your Name",
  "photo": "/images/members/your-photo.jpg",
  "bio": "Updated bio text here...",
  "memberSince": "2019-03-15",
  "favoritePizzaStyle": "Chicago Deep Dish",
  "restaurantsVisited": 48  // Increment when you visit a new place!
}
```

### Adding a Restaurant Visit

In `restaurants.json`, find the restaurant and add a new visit to the visits array:

```json
{
  "date": "2025-01-20",
  "ratings": {
    "overall": 4.6,
    "crust": 4.7,
    "sauce": 4.5,
    "cheese": 4.8,
    "toppings": 4.4,
    "value": 4.3
  },
  "attendees": ["mike-rossi", "sarah-chen", "tony-martinez"],
  "notes": "Great night! The sausage was perfectly seasoned."
}
```

## JSON Format Rules

⚠️ **Important**: JSON is picky about formatting!

1. **Quotes**: Always use double quotes `"` not single quotes `'`
2. **Commas**: Every item needs a comma EXCEPT the last one
3. **Dates**: Use format `"2025-01-20T18:00:00"` for date/time
4. **Numbers**: Don't put quotes around numbers (ratings, coordinates)

### Valid JSON:
```json
{
  "name": "Pizza Place",
  "rating": 4.5,
  "visited": true
}
```

### Invalid JSON:
```json
{
  'name': 'Pizza Place',  // Wrong: single quotes
  "rating": "4.5"         // Wrong: quotes around number
  "visited": true,        // Wrong: comma on last item
}
```

## Common Tasks

### Cancel an Event
- Delete the entire event object from `events.json`
- OR add `"cancelled": true` to keep it for history

### Fix a Typo
- Edit the file, fix the typo, commit with message like "Fixed typo in restaurant name"

### Update Ratings After Discussion
- Find the visit in `restaurants.json`
- Update the ratings object with agreed-upon scores

## Getting Help

### If You See an Error
- GitHub will show a red X if your edit broke something
- Click on it to see what went wrong
- Usually it's a missing comma or quote

### If You're Unsure
- Ask in the Pizza Club group chat
- Tag @mike-rossi in the GitHub commit message
- Use "Create pull request" instead of direct commit for review

## Tips for Success

1. **Make Small Changes**: Edit one thing at a time
2. **Preview First**: Use the "Preview" tab to check your changes
3. **Copy the Format**: Look at existing entries and copy their structure
4. **Test Locally**: Open the JSON file in https://jsonlint.com to validate

## Emergency Rollback

If something goes wrong:
1. Go to the "History" of the file (clock icon)
2. Find the last working version
3. Click "Revert" to undo your changes

---

Remember: The website updates automatically after every change. If you don't see your updates after 5 minutes, check your email for error notifications!