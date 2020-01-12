# What is OneMark?
### [OneMark](https://onemark.herokuapp.com) is a visual-centric bookmark organizer designed for cross-platform use with a sleek, modern interface.

### This passion project was created from scratch in order to expand upon and demonstrate my capabalities as a developer. No libraries or frameworks were used in the creation of this project, and all knowledge and techniques are derived from self-teaching and countless hours of research.

### OneMark started off as an unnamed side-project for displaying miscellaneous bookmarks that needed more than just a title and URL to know the contents of at a glance. What began as a simple front-end interface for a JSON file of bookmarks I had been tediously updating became a comprehensive full-stack experience, the centerpiece of my portfolio, and a labor of love as I continue to work on it in my spare time.

### I hope that others can find use in and enjoyment from this small project. If you have any suggestions, issues to report, or other general comments, please feel free to use the appropriate sections of the GitHub repository or contact me at mohamed.sihly@gmail.com. Thank you for your interest.

---
# Disclaimers
*OneMark is designed and tested on **Chrome v78+**. Most features of OneMark are supported by Mozilla Firefox and other Chromium based browsers; however, support is NOT gauranteed. Due to the use of EMCAScript 2018 functionality, the bookmark search feature may not be properly supported by Firefox. Microsoft Edge will not properly access several features of OneMark. Internet Explorer is not, and will not be, supported by OneMark.*

---
# Changelog
*The version histories below do not account for all changes made as documentation is written from the To-Do-List in the following major section and from memory prior to each commit. Additionally, minor changes are typically not recorded in the changelog or in the To-Do-List. Analysis of the differences on GitHub can be used to identify undocumented changes when necessary.*

## Version 0.64 &nbsp;-&nbsp; (2020-01-12)
* Fixed critical error in `createTag()` caused by `querySelector` processing speed
    * Switched `querySelector` call to `getElementById` for proper sequential declaration
    * Updated tag HTML structure to include another ID for the `getElementById` call
* Modified `createBookmark` to replace `createElement`s with ES6 string literal for improved readability and updating
    * Contextual fragment used to add event listeners
* Updated `main.js` and `login.js` to use string literals instead of concatenation
* Fixed error in `RegExp` creation in `searchBookmarks()` causing bookmarks with spaces in any of their properties to be incorrectly displayed at all times
* Updated `searchBookmarks()` to use ES6 destructuring assignment and `map()` array function in place of repetitive code where applicable
* Updated `db-connect.php` to use environment variables instead of hardcoded database credentials

## Version 0.63 &nbsp;-&nbsp; (2020-01-10)
* Created `page-load.js` to solve issue of page flicker between login and main pages
    * Script runs before loading DOM using `defer` tag and checks for user status via PHP
    * Flickering has not been fixed
        * Priority assigned to *Completed*; however, the task is essentially assigned the lowest priority for revision
        * Flickering of bookmarks now occurs due to delay introduced by having to use AWS S3 instead of the local filesystem; however, impact is negligible due to memory caching
        * Highest impact on page load times now reassigned to `get-bookmarks.php` and `login.php`

## Version 0.62 &nbsp;-&nbsp; (2020-01-10)
* Due to the nature of Heroku's ephemeral file storage system, the storage of uploaded images needed to be switched to a persistent storage server
    * The free tier of Amazon S3 is being used for 5GB of image storage
        * IAM user given `*list`, `*read`, `*write`, and `PutObjectACL` permissions
    * Load AWS SDK
        * AWS SDK installed using `composer.json`
        * Bucket name and S3 credentials stored in and retrieved from Heroku configuration variables
    * Update `upload.php` file to use Amazon S3 bucket instead of local filesystem
        * Image paths and urls modified to use quasi-directories to account for flat architecture

## Version 0.61 &nbsp;-&nbsp; (2020-01-09)
* Hotfix of incorrect commit resulting in old files not being removed

## Version 0.60 &nbsp;-&nbsp; (2020-01-09)
* Partial rewrite of database to isolate images to their own table with a relationship to the `Bookmark` table
* Store image hashes from PHP in database `Images` table with a unique index constraint to search for duplicate images on upload and set image paths to existing images instead of reuploading or overwriting them
* Extensive rewrite of PHP files to abstract all database-related functions and merge with the AuthTokens module to create the `db-functions.php` file for one comprehensive `include`
* Removed `.menu-toggle` sub-elements to replace with pseudo-elements
    * Updated design definitions to more standard practices
    * Updated modal-close buttons to follow the same design practices
* Access to sensitive PHP files restricted to server-only via .htaccess configuration
* Abstraction of common functions to `common.js` module using `import` and `export` API
* Form validation / restrictions via HTML, JS, and PHP for forms on login and main pages
    * Temporary toasts replaced with new error labels adjacent to form fields
* Align minimum and maximum values for JS / PHP input with values in database
* Search bookmarks using regular expressions
    * Filter by title, url, and tags using the form `[type]:` for prefixes
        * Toggle AND/OR for terms
        * Toggle full-word for terms
    * Associated helper functions for removing, hiding, and showing bookmarks
    * General debouncing function to limit search calculations
* Bookmark tagging system implemented and completed
    * Many-to-many relationship between `Bookmark` and `Tag` tables using `BookmarkTag` bridge table
    * On bookmark upload / edit, tags are compared to existing tags and added or removed from the `BookmarkTag` table. Tags are added to the `Tag` table if they do not exist
    * Upload and edit modals redesigned to include a tags container
        * Search field with inline-button that shows as "x" when the tag is in the list and "+" otherwise
        * Box below search with rows listing tags with "x" buttons next to them
* Cleaned up and updated JS code to use more ES6 elements (arrow functions, ternary and spread operators, destructuring assignment, etc.)
* Added `AccessLevel` column to `User` database table for potential future uses
    * Check when requesting access to restricted files and functions
    * Add `Standard` and `Admin` for development; add `Premium` in production
* Updated bookmark image hover animation to move along both dimensions
    * To account for jittering introduced by minimal movements on the x-axis, the duration has been reduced from `5s` to `2s` and the timing function has been changed to `linear`
    * To return the animation to the center without modifying the `keyframes` definition of `movePosition`, the iteration count has been increased from `2` to `2.5`
* Transferral of To-Do-List from `main.js` to `readme.md`
    * Consolidation of To-Do-List and GitHub commit changelogs into one entity
    * Retroactive updates to To-Do-List and changelogs to improve information granularity, consistency, and formatting

## Version 0.51 &nbsp;-&nbsp; (2019-10-01)
* Hotfix for graphical issues caused by improper commit

## Version 0.50 &nbsp;-&nbsp; (2019-10-01)
* Complete visual redesign to a consistent, material design
* Mobile responsiveness added where relevant (not including touch features)
* Navigation bar added to contain miscellaneous buttons and future features
* Updates of JS and PHP corresponding with redesign
* Authentication tokens / "Remember Me" functionality fully implemented
* Code cleanup and optimization
* Improved to-do-list organization

## Version 0.40 &nbsp;-&nbsp; (2019-08-26)
* Token authentication and persistent login system added
* Logging system added (primarily for development debugging)
* Cleaned up interactions between JS and PHP to show users appropriate messages and redirect to the correct locations
* New functions added in PHP and JS along with optimizations and code cleanup

## Version 0.30 &nbsp;-&nbsp; (2019-07-21)
* Creation of Database and PHP Scripts
* Updates to HTML Structure
* Minor modifications to CSS
* Sweeping shanges to Javascript core functions and introduction of new functions in correspondance with introduction of PHP scripts

## Version 0.20 &nbsp;-&nbsp; (2019-02-10)
* Initial commits of existing files

---
# Tentative To-Do-List
*The contents of this section are not meant to track changes or provide gaurantees of features to be added. This To-Do-List undergoes constant modification during development that is not reflected here and only serves as a space to store ideas for future features and implementation strategies.*
## High Priority:
* Alert modal
    * Options passed to `switch` or `if_else` chain (types of buttons shown, if any; enable / disable closing the dialog box without selecting an option; opacity, color, blur of modal background)
    * Display metadata info (Date Created, Date Modified, etc.) in its own alert
        * Add *'Info'* option to bookmark dropdown
* Settings modals
    * Account info (date created, total bookmarks, storage space, etc.)
    * Edit account (email, password, username)
* Edit modal - remove image button (set to no image url)
* Lazy-load elements not in viewport using `IntersectionObserver`
* Bookmark folder system
    * **Option 1:** Use `activeBookmarks` for filtering and possibly for grouping with root levels in JSON as folders and sub-levels as contents
    * **Option 2:** Add `active` flag to each bookmark and remove `activeBookmarks` array.
        * Database `Folder` table with folder information linked to each bookmark; null `FolderID` for root directory
        * PHP loop through `bindParam()` on folder modification to make use of prepared statements
    * Edit mode - Shrink bookmarks / folders to show margin for group selection. Colored border on highlight. Drag & drop - onto folder to add; onto breadcrumb / file-explorer menu to remove / move to higher directory

## Medium Priority:
* Page sequencing and navigation (max bookmarks per screen); jump to specific page
* Sort bookmarks (lexicographic, date created, date modified, manual w/ drag & drop, etc.)
* Bookmark views (tiles, content, list, etc.)
* Drag-and-drop images onto upload
* Undo function ~~- transfer bookmark information to `removedBookmarks` array before deleting (will only last until page renavigation); dual-layer array for future group actions~~
    * Record all reversible actions to transient, multi-dimensional `actionHistory` array
* Add close button to toasts and inline messages
* Add name column to Token db-table (i.e. Windows 10-PC / Chrome / IP Address) and date created, last accessed, and possibly revoked for authenticating other apps / users

## Low Priority:
* Modify `insertInlineMessage` to allow for different styles (particularly for form validation response text under the inputs)
* Custom error pages - 403, 404 (open book with pages torn out)
* Export/import bookmarks
    * Download images and associate with other bookmark info in JSON
    * Import by batch uploading each bookmark and skipping conflicts and errors (to be remedied manually)
* Confirm email on register with PHP
* *'Forgot password?'* option to reset via email
* Image cleanup script to check database at set intervals for images not associated with any bookmarks
* Add icon to *'No Bookmarks'* overlay
* Background image and theme color selection
* Logo - Book with visible bookmark
* In-line image cropping
* Compress large images on upload
* Create sprite-sheet for small icons
* Share read-only view of bookmarks via link
* Include HTMLtoCanvas library for screenshot uploads
* Modify logging function to output more info in JSON format and read via custom reader
    * **Production:** Implement Monolog library and read via third-party log reader

## Completed:
* Create `Page-load.js` and load as first script to avoid flickering
    * Check for user authentication before loading DOM
    * Create separate PHP file for checking user status
* Log transactions and responses in PHP. Accomplished with `logToFile()`
* Persistent login via cookie / session / tokens
* Close all open menus and modals when clicking out of their containers
* Sticky top navigation
    * Left - create bookmark (shrinks to '+')
    * Middle - search
    * Right - menu (shrinks to down-chevron)
* Replace *'No Bookmarks'* toast with background overlay
    * Toggle `.empty` in `.bookmark-container` classList
    * Check on load / deletion of bookmarks / folder open if `activeBookmarks` is empty
* Mobile responsiveness for login and bookmarks pages
* Access to sensitive PHP files restricted to server-only
* Extensive rewrite of PHP to abstract all database-related functions and merge with the AuthTokens module in one comprehensive `include`
* Partial rewrite of database to isolate images to their own table with a relationship to the `Bookmark` table
* Store image hashes from PHP in database `Images` table with a unique index constraint to search for duplicate images on upload and set image paths to existing images instead of reuploading or overwriting them
* Align min and max values for JS / PHP input with values in database
* Replace `.menu-toggle` with `::before` to create the arrow and apply an rgba() background-color and 50% border-radius (for a circle) to the outer container
    * Change modal close buttons styling to work the same way
* Bookmark tagging - many to many relationship between bookmarks and tags using bridge table
    * On bookmark upload / edit submission, loop through tags to add or remove from `BookmarkTag` table; add to Tag table if they do not exist
* Search bookmarks using regular expressions
    * Filter by title, url, and tags using the form `[type]:` for prefixes
        * Toggle AND/OR for terms
        * Toggle full-word for terms
    * Associated helper functions for removing, hiding, and showing bookmarks
    * General debouncing function to limit search calculations
* Cleaned up and updated JS code to use more ES6 elements (arrow functions, ternary and spread operators, destructuring assignment)
* Import / export common functions using modules
* Form validation / restrictions via HTML, JS, and PHP for login / register forms and url & title fields in upload and edit modals
    * Loop through elements to validate
    * Use new error labels
* Bookmark tagging system
    * ~~Store bookmark tags as Tags attribute of space-separated string~~ Append tags as array to JSON in PHP instead of imploding to string and parsing in JS
    * ~~Restrict tags to single-word, alphanumerical, length 30~~
    * Search field for tags with button inline on right that shows as "x" when the tag is in the list and "+" when it is not
    * Box below search with rows ~~(and columns at large screen-widths)~~ listing tags with "x" buttons next to them
    * Create temp array on modal open and populate with existing tags, if any
        * Modifications and searches are made on the temp array
        * Append tags array to formData on submit
* Add AccessLevel column to User db-table
    * Check when requesting access to restricted files and functions
    * Add "Standard" and "Admin" for development, add "Premium" in production
* Reformat `eventListeners` and `themes` global variables for proper viewing and editing
    * ~~Import from `objects.js` module~~ *Too difficult / practically impossible to implement due to restrictions on `addEventListener` and function references*
    * Change from `var` to `const`
    * Hide with code folding
* Update bookmark image hover animation to move along both dimensions
    * To account for jittering introduced by minimal movements on the x-axis, the duration has been reduced from `5s` to `2s` and the timing function has been changed to `linear`
    * To return the animation to the center without modifying the `keyframes` definition of `movePosition`, the iteration count has been increased from `2` to `2.5`
* Due to the nature of Heroku's file storage system, the storage of uploaded images needs to be switched to a separate server
    * Use free tier of Amazon S3 for 5GB of image storage
        * IAM user needs `*list`, `*read`, `*write`, and `PutObjectACL` permissions
    * Load AWS SDK
        * Install AWS SDK using `composer.json`
        * Load bucket name and S3 credentials from Heroku configuration variables
    * Update `.gitignore` to keep `vendor/` out of version control
    * Update `upload.php` file to use Amazon S3 bucket instead of local filesystem
        * Modify image paths and urls to use quasi-directories to account for flat architecture
* Fixed critical error in `createTag()` caused by `querySelector` processing speed
    * Switched `querySelector` call to `getElementById` for proper sequential declaration
    * Updated tag HTML structure to include another ID for the `getElementById` call
* Modified `createBookmark` to use ES6 string literal for improved readability and updates
    * Contextual fragment used to add event listeners
* Fixed error in `RegExp` creation in `searchBookmarks()` causing bookmarks with spaces in any of their properties to be incorrectly displayed at all times
* Updated `searchBookmarks()` to use ES6 destructuring assignment and `map()` array function in place of repetitive code where applicable
* Updated `db-connect.php` to use environment variables instead of hardcoded database credentials
* Updated `main.js` and `login.js` to use string literals instead of concatenation