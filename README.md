# Kyatt's Corner: Personal Tierlists & Media Collection

This is a personal web application built with Next.js and Tailwind CSS to showcase my personal rankings, tier lists, and media collections. It features a dynamic tier list viewer and a comprehensive, filterable movie/TV series catalog.

**Live Demo:** [https://kyattpl.github.io/my-tierlists-ranking/](https://kyattpl.github.io/my-tierlists-ranking/)

---

## ✨ Features

### Tier List Dashboard
- **Hierarchical Navigation**: Browse through nested categories and lists with a collapsible sidebar.
- **Dual View Modes**:
    - **Tier View**: A classic, visual layout grouping items by tier (S, A, B, etc.).
    - **Table View**: A detailed, sortable table with all custom-defined columns.
- **Dynamic Search & Sort**: Instantly search for items within a list and sort the table by any column.
- **Responsive Design**: Fully functional on both desktop and mobile devices.
- **Dark/Light Theme**: A theme toggle that respects system preference and saves user choice.

### Movie & Series Collection
- **Data-Driven from CSV**: The entire collection is populated from a simple `movies.csv` file.
- **Advanced Filtering & Searching**: Filter the collection by genre or status, and perform a global search across titles, directors, and actors.
- **Sortable Table**: All columns in the desktop view are sortable in ascending or descending order.
- **Responsive Card View**: On mobile, the collection switches to an intuitive card-based layout, complete with movie posters.
- **Pagination**: Efficiently handles large collections with easy-to-use pagination controls.
---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Parsing**: [csv-parser](https://www.npmjs.com/package/csv-parser)

---

## 📂 Project Structure

-   `app/page.tsx`: The main entry point for the Tier List application. Contains the UI and mocked data.
-   `app/collection/movies/`: The directory for the Movie Collection feature.
    -   `page.tsx`: A Server Component that reads and parses `movies.csv` at build time.
    -   `MovieCollectionClient.tsx`: A Client Component that handles all interactivity (search, sort, filter, pagination).
    -   `CollectionHeader.tsx`: The header component for the collection page.
-   `data/movies.csv`: The data source for the movie collection (you must create this file).