# Replit Authentication and Notification System Fix
# Complete solution for login/logout and message bell functionality

from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime, timedelta
import secrets

# Initialize Flask app with proper session configuration
app = Flask(__name__)

# Configure session settings for Replit
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', secrets.token_hex(16))
app.config['SESSION_COOKIE_SECURE'] = False  # Set to False for Replit HTTP
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

# Database initialization
def init_db():
    """Initialize the database with users and notifications tables"""
    conn = sqlite3.connect('civigrant.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            organization TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            is_active BOOLEAN DEFAULT 1
        )
    ''')
    
    # Notifications table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            is_read BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create default admin user if not exists
    cursor.execute('SELECT COUNT(*) FROM users WHERE username = ?', ('admin',))
    if cursor.fetchone()[0] == 0:
        admin_password = generate_password_hash('admin123')
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, first_name, last_name, organization)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('admin', 'admin@civigrant.com', admin_password, 'Admin', 'User', 'CiviGrantAI'))
        
        # Add welcome notification for admin
        cursor.execute('''
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (1, 'Welcome to CiviGrantAI', 'Your account has been created successfully!', 'success')
        ''')
    
    conn.commit()
    conn.close()

# Authentication helper functions
def get_user_by_username(username):
    """Get user by username"""
    conn = sqlite3.connect('civigrant.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ? AND is_active = 1', (username,))
    user = cursor.fetchone()
    conn.close()
    return user

def get_user_by_id(user_id):
    """Get user by ID"""
    conn = sqlite3.connect('civigrant.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ? AND is_active = 1', (user_id,))
    user = cursor.fetchone()
    conn.close()
    return user

def create_user(username, email, password, first_name, last_name, organization):
    """Create a new user"""
    conn = sqlite3.connect('civigrant.db')
    cursor = conn.cursor()
    
    password_hash = generate_password_hash(password)
    
    try:
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, first_name, last_name, organization)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (username, email, password_hash, first_name, last_name, organization))
        
        user_id = cursor.lastrowid
        
        # Add welcome notification
        cursor.execute('''
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (?, ?, ?, ?)
        ''', (user_id, 'Welcome to CiviGrantAI', 'Your account has been created successfully!', 'success'))
        
        conn.commit()
        return user_id
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def update_last_login(user_id):
    """Update user's last login timestamp"""
    conn = sqlite3.connect('civigrant.db')
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()

# Notification functions
def get_user_notifications(user_id, unread_only=False):
    """Get user notifications"""
    conn = sqlite3.connect('civigrant.db')
    cursor = conn.cursor()
    
    if unread_only:
        cursor.execute('''
            SELECT * FROM notifications 
            WHERE user_id = ? AND is_read = 0 
            ORDER BY created_at DESC
        ''', (user_id,))
    else:
        cursor.execute('''
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 50
        ''', (user_id,))
    
    notifications = cursor.fetchall()
    conn.close()
    return notifications

def mark_notification_read(notification_id, user_id):
    """Mark notification as read"""
    conn = sqlite3.connect('civigrant.db')
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE notifications 
        SET is_read = 1 
        WHERE id = ? AND user_id = ?
    ''', (notification_id, user_id))
    conn.commit()
    conn.close()

def add_notification(user_id, title, message, notification_type='info'):
    """Add a new notification"""
    conn = sqlite3.connect('civigrant.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (?, ?, ?, ?)
    ''', (user_id, title, message, notification_type))
    conn.commit()
    conn.close()

# Authentication decorator
def login_required(f):
    """Decorator to require login for routes"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    """Home page - redirect to dashboard if logged in, otherwise show landing page"""
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('landing.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Login page"""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        if not username or not password:
            flash('Please enter both username and password.', 'error')
            return render_template('login.html')
        
        user = get_user_by_username(username)
        
        if user and check_password_hash(user[3], password):  # user[3] is password_hash
            session['user_id'] = user[0]
            session['username'] = user[1]
            session['first_name'] = user[4]
            session['last_name'] = user[5]
            session.permanent = True
            
            update_last_login(user[0])
            
            # Add login notification
            add_notification(user[0], 'Login Successful', f'Welcome back, {user[4]}!', 'success')
            
            flash(f'Welcome back, {user[4]}!', 'success')
            
            # Redirect to intended page or dashboard
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password.', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    """Registration page"""
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        organization = request.form.get('organization', '').strip()
        
        # Validation
        if not all([username, email, password, first_name, last_name]):
            flash('Please fill in all required fields.', 'error')
            return render_template('register.html')
        
        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return render_template('register.html')
        
        if len(password) < 6:
            flash('Password must be at least 6 characters long.', 'error')
            return render_template('register.html')
        
        # Create user
        user_id = create_user(username, email, password, first_name, last_name, organization)
        
        if user_id:
            flash('Account created successfully! Please log in.', 'success')
            return redirect(url_for('login'))
        else:
            flash('Username or email already exists.', 'error')
    
    return render_template('register.html')

@app.route('/logout')
def logout():
    """Logout and clear session"""
    if 'user_id' in session:
        # Add logout notification before clearing session
        add_notification(session['user_id'], 'Logged Out', 'You have been logged out successfully.', 'info')
    
    session.clear()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    """Main dashboard"""
    user = get_user_by_id(session['user_id'])
    notifications = get_user_notifications(session['user_id'], unread_only=True)
    
    return render_template('dashboard.html', 
                         user=user, 
                         unread_notifications=len(notifications))

# API Routes for notifications
@app.route('/api/notifications')
@login_required
def api_notifications():
    """Get user notifications as JSON"""
    notifications = get_user_notifications(session['user_id'])
    
    notifications_list = []
    for notif in notifications:
        notifications_list.append({
            'id': notif[0],
            'title': notif[2],
            'message': notif[3],
            'type': notif[4],
            'is_read': bool(notif[5]),
            'created_at': notif[6]
        })
    
    return jsonify(notifications_list)

@app.route('/api/notifications/unread-count')
@login_required
def api_unread_count():
    """Get unread notification count"""
    notifications = get_user_notifications(session['user_id'], unread_only=True)
    return jsonify({'count': len(notifications)})

@app.route('/api/notifications/<int:notification_id>/read', methods=['POST'])
@login_required
def api_mark_read(notification_id):
    """Mark notification as read"""
    mark_notification_read(notification_id, session['user_id'])
    return jsonify({'success': True})

@app.route('/api/notifications/mark-all-read', methods=['POST'])
@login_required
def api_mark_all_read():
    """Mark all notifications as read"""
    conn = sqlite3.connect('civigrant.db')
    cursor = conn.cursor()
    cursor.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', (session['user_id'],))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Context processor to make user info available in all templates
@app.context_processor
def inject_user():
    """Inject user info into all templates"""
    if 'user_id' in session:
        user = get_user_by_id(session['user_id'])
        unread_count = len(get_user_notifications(session['user_id'], unread_only=True))
        return {
            'current_user': user,
            'unread_notifications_count': unread_count
        }
    return {'current_user': None, 'unread_notifications_count': 0}

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

# Initialize database on startup
if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)

