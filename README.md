# 🎵 Atala-Music Telegram Bot

**Atala-Music** is a Telegram bot that allows users to search and listen to songs, explore by genre, and manage personal playlists with simple text commands.

## 💡 Features

- Search for songs by name
- Browse music by genre
- Create and manage personal playlists
- View other users' playlists
- Easy-to-use Telegram commands

## 🧾 Available Commands

| Command                          | Description                               |
|----------------------------------|-------------------------------------------|
| `/start`                         | Start the bot                             |
| `/search <name>`                 | Search for a song by name                 |
| `/genre`                         | Browse songs by genre                     |
| `/myplaylist`                    | View your personal playlist               |
| `/addtoplaylist <name>`          | Add a song to your playlist               |
| `/playlist <username>`           | View another user's playlist              |
| `/help`                          | Show this help message                    |

## 🗃️ Database Tables

The project includes the following main tables:

### 1. `users`
Stores user information.

| Column        | Type        | Description         |
|---------------|-------------|---------------------|
| `id`          | String      | Primary key         |
| `username`    | String      | Telegram username   |
| `phone_number`| String      | Telegram username   |
| `playlist_id` | String      | Playlist id         |
| `created_at`  | Timestamp   | Registration date   |

### 2. `musics`
Stores available songs.

| Column        | Type        | Description         |
|---------------|-------------|---------------------|
| `id`          | String      | Primary key         |
| `name`        | String      | Song name           |
| `author`      | String      | Author name         |
| `genre`       | String      | Song genre          |
| `url`         | String      | Music file URL/link |
| `uploaded_by` | String      | Upload user name    |

### 3. `playlists`
Stores user playlists.

| Column        | Type        | Description         |
|---------------|-------------|---------------------|
| `id`          | String      | Primary key         |
| `name'        | String      | Playlist name       |
| `user_id`     | String      | Reference to `users`|
| `music_id`    | String      | Reference to `songs`|

### 4. `music_ratings`
Stores user playlists.

| Column        | Type        | Description         |
|---------------|-------------|---------------------|
| `id`          | String      | Primary key         |
| `music_id`    | String      | Reference to `users`|
| `likes`       | number      | music likes         |
| `dislikes`    | number      | music dislikes      |


## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/MrHojiakbar/Atala-Music_BOT
