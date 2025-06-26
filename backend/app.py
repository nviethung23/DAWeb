from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import jwt
import requests
import os
import json
from functools import wraps
import datetime
from dotenv import load_dotenv
from bson import ObjectId
import smtplib
from email.mime.text import MIMEText


load_dotenv()

app = Flask(__name__)
CORS(app)


# MongoDB Config
app.config["MONGO_URI"] = os.environ.get("MONGO_URI", "mongodb://localhost:27017/pn_movie")
mongo = PyMongo(app)

# Secret Key for JWT
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "supersecretkey")

# Upload folder configs
app.config['UPLOAD_FOLDER_POSTER'] = 'uploads/posters'
app.config['UPLOAD_FOLDER_VIDEO'] = 'uploads/videos'
app.config['UPLOAD_FOLDER_TRAILER'] = 'uploads/trailers'
app.config['ALLOWED_IMAGE_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
app.config['ALLOWED_VIDEO_EXTENSIONS'] = {'mp4', 'mkv', 'webm'}
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 1024  # 1GB

DATA_FILE = 'my_movies.json'

def allowed_image(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_IMAGE_EXTENSIONS']

def allowed_video(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_VIDEO_EXTENSIONS']

# ----------- Auth Middleware -----------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith("Bearer "):
            return jsonify({"error": "Token is missing!"}), 401
        try:
            token_str = token.split(" ")[1]
            data = jwt.decode(token_str, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = mongo.db.users.find_one({"username": data['username']})
            if not current_user:
                return jsonify({"error": "Tài khoản không tồn tại!"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token đã hết hạn!"}), 401
        except Exception as e:
            return jsonify({"error": "Invalid token!"}), 401
        kwargs['current_user'] = current_user
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user = kwargs.get('current_user')
        if not current_user or current_user.get('role') != 'admin':
            return jsonify({'error': 'Bạn không phải admin!'}), 403
        return f(*args, **kwargs)
    return decorated

# ----------- Auth Routes -----------
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if not all(k in data for k in ("username", "password", "email")):
        return jsonify({"error": "Thiếu thông tin"}), 400

    if mongo.db.users.find_one({"username": data["username"]}):
        return jsonify({"error": "Tài khoản đã tồn tại"}), 400

    hashed_pw = generate_password_hash(data['password'])
    user = {
        "username": data['username'],
        "password": hashed_pw,
        "email": data['email'],
        "role": "user",  # Mặc định user thường
        "created_at": datetime.datetime.utcnow(),
        "displayName": data.get('displayName', ""),   # Thêm field displayName mặc định rỗng
        "avatar": data.get('avatar', ""),              # Thêm avatar mặc định rỗng
        "gender": data.get('gender', "other")
    }
    mongo.db.users.insert_one(user)
    return jsonify({"success": True, "message": "Đăng ký thành công"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = mongo.db.users.find_one({"username": data["username"]})
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({"error": "Sai tài khoản hoặc mật khẩu"}), 401

    token = jwt.encode({
        "username": user['username'],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        "token": token,
        "role": user.get("role"),
        "email": user.get("email"),
        "username": user.get("username"),
        "displayName": user.get("displayName", ""),
        "avatar": user.get("avatar", ""),
        "gender": user.get("gender", "other")
    })

@app.route('/api/profile', methods=['GET'])
@token_required
def profile(current_user):
    # Trả về các trường profile, ưu tiên displayName
    return jsonify({
        "username": current_user.get('username'),
        "email": current_user.get('email'),
        "role": current_user.get('role'),
        "displayName": current_user.get('displayName', ''),
        "avatar": current_user.get('avatar', ''),
        "gender": current_user.get('gender', 'other')
    })

# ------- PATCH PROFILE (UPDATE PROFILE) -------
@app.route('/api/profile', methods=['PATCH'])
@token_required
def update_profile(current_user):
    data = request.json
    update_fields = {}
    for field in ["displayName", "avatar", "gender"]:
        if field in data:
            update_fields[field] = data[field]
    if update_fields:
        mongo.db.users.update_one({"_id": current_user["_id"]}, {"$set": update_fields})
    # Lấy lại user đã update
    user = mongo.db.users.find_one({"_id": current_user["_id"]})
    user["_id"] = str(user["_id"])
    user.pop("password", None)
    return jsonify({
        "success": True,
        "user": {
            "username": user.get('username'),
            "email": user.get('email'),
            "role": user.get('role'),
            "displayName": user.get('displayName', ''),
            "avatar": user.get('avatar', ''),
            "gender": user.get('gender', 'other')
        }
    })

# ----------- Movie Utilities -----------
def load_movies():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False)
    with open(DATA_FILE, encoding='utf-8') as f:
        return json.load(f)

def save_movies(movies):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(movies, f, ensure_ascii=False, indent=2)

# ----------- Movie CRUD (admin only) -----------
@app.route('/api/movies', methods=['POST'])
@token_required
@admin_required
def add_movie(current_user):
    data = request.form
    title = data.get("title")
    description = data.get("description")
    movie_type = data.get("type", "single")
    year = data.get("year")
    country = data.get("country")
    genre = data.get("genre")
    actors = data.get("actors", "")
    trailer_link = data.get("trailer", "")

    if not all([title, description, year, country, genre]):
        return jsonify({"success": False, "message": "Thiếu thông tin phim!"}), 400

    # Xử lý actors
    actor_list = [a.strip() for a in actors.split(",")] if isinstance(actors, str) else list(actors)

    # Xử lý poster
    poster_path = ""
    if 'poster' in request.files:
        poster = request.files['poster']
        if poster and allowed_image(poster.filename):
            filename = secure_filename(poster.filename)
            save_path = os.path.join(app.config['UPLOAD_FOLDER_POSTER'], filename)
            os.makedirs(app.config['UPLOAD_FOLDER_POSTER'], exist_ok=True)
            poster.save(save_path)
            poster_path = f"/uploads/posters/{filename}"
        else:
            return jsonify({"success": False, "message": "File poster không hợp lệ!"}), 400

    # Xử lý trailer file
    trailer_file_path = ""
    if 'trailer_file' in request.files:
        trailer_file = request.files['trailer_file']
        if trailer_file and allowed_video(trailer_file.filename):
            t_filename = secure_filename(trailer_file.filename)
            t_save_path = os.path.join(app.config['UPLOAD_FOLDER_TRAILER'], t_filename)
            os.makedirs(app.config['UPLOAD_FOLDER_TRAILER'], exist_ok=True)
            trailer_file.save(t_save_path)
            trailer_file_path = f"/uploads/trailers/{t_filename}"
        else:
            return jsonify({"success": False, "message": "File trailer không hợp lệ!"}), 400

    # Xử lý video phim
    video_path = ""
    if 'video' in request.files:
        video = request.files['video']
        if video and allowed_video(video.filename):
            v_filename = secure_filename(video.filename)
            v_save_path = os.path.join(app.config['UPLOAD_FOLDER_VIDEO'], v_filename)
            os.makedirs(app.config['UPLOAD_FOLDER_VIDEO'], exist_ok=True)
            video.save(v_save_path)
            video_path = f"/uploads/videos/{v_filename}"
        else:
            return jsonify({"success": False, "message": "File video không hợp lệ!"}), 400

    # Xử lý gallery (nhiều ảnh)
    gallery_paths = []
    if 'gallery' in request.files:
        for file in request.files.getlist('gallery'):
            if file and allowed_image(file.filename):
                g_filename = secure_filename(file.filename)
                g_save_path = os.path.join(app.config['UPLOAD_FOLDER_POSTER'], g_filename)
                file.save(g_save_path)
                gallery_paths.append(f"/uploads/posters/{g_filename}")

    movies = load_movies()
    new_id = max([m['id'] for m in movies], default=100000) + 1
    movie = {
        "id": new_id,
        "title": title,
        "description": description,
        "year": int(year),
        "country": country,
        "genre": genre,
        "actors": actor_list,
        "poster": poster_path,
        "trailer": trailer_file_path or trailer_link,
        "video": video_path,
        "gallery": gallery_paths,
        "type": movie_type,
        "created_by": current_user['username'],
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    movies.append(movie)
    save_movies(movies)
    return jsonify({"success": True, "movie": movie, "message": "Thêm phim thành công!"}), 201

@app.route('/api/movies/<int:movie_id>', methods=['PUT'])
@token_required
@admin_required
def edit_movie(movie_id, current_user):
    data = request.form
    movies = load_movies()
    for m in movies:
        if m['id'] == movie_id:
            # Chỉ cho phép sửa bởi admin
            for k in ["title", "description", "year", "country", "genre", "actors", "type"]:
                if k in data:
                    m[k] = data[k]

            # Cập nhật file nếu có upload mới
            if 'poster' in request.files:
                poster = request.files['poster']
                if poster and allowed_image(poster.filename):
                    filename = secure_filename(poster.filename)
                    save_path = os.path.join(app.config['UPLOAD_FOLDER_POSTER'], filename)
                    poster.save(save_path)
                    m['poster'] = f"/uploads/posters/{filename}"
            if 'trailer_file' in request.files:
                trailer_file = request.files['trailer_file']
                if trailer_file and allowed_video(trailer_file.filename):
                    t_filename = secure_filename(trailer_file.filename)
                    t_save_path = os.path.join(app.config['UPLOAD_FOLDER_TRAILER'], t_filename)
                    trailer_file.save(t_save_path)
                    m['trailer'] = f"/uploads/trailers/{t_filename}"
            if 'video' in request.files:
                video = request.files['video']
                if video and allowed_video(video.filename):
                    v_filename = secure_filename(video.filename)
                    v_save_path = os.path.join(app.config['UPLOAD_FOLDER_VIDEO'], v_filename)
                    video.save(v_save_path)
                    m['video'] = f"/uploads/videos/{v_filename}"

            save_movies(movies)
            return jsonify({"success": True, "movie": m, "message": "Sửa phim thành công!"}), 200
    return jsonify({"success": False, "message": "Không tìm thấy phim!"}), 404

@app.route('/api/movies/<int:movie_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_movie(movie_id, current_user):
    movies = load_movies()
    for m in movies:
        if m['id'] == movie_id:
            movies.remove(m)
            save_movies(movies)
            return jsonify({"success": True, "message": "Xóa phim thành công!"}), 200
    return jsonify({"success": False, "message": "Không tìm thấy phim!"}), 404

# ----------- Movie View (ai cũng xem được) -----------
@app.route('/api/movies', methods=['GET'])
def get_movies():
    movies = load_movies()
    return jsonify({"success": True, "movies": movies}), 200

@app.route('/api/movies/<int:movie_id>', methods=['GET'])
def get_movie_detail(movie_id):
    movies = load_movies()
    for m in movies:
        if m['id'] == movie_id:
            return jsonify({"success": True, "movie": m}), 200
    return jsonify({"success": False, "message": "Không tìm thấy phim!"}), 404

# ----------- API yêu thích, xem sau cho user thường -----------
@app.route('/api/favorite', methods=['POST'])
@token_required
def add_favorite(current_user):
    movie_id = str(request.json.get("movie_id"))
    source = request.json.get("source", "local")
    if not movie_id or not source:
        return jsonify({"success": False, "message": "Thiếu movie_id hoặc source!"}), 400

    movie_obj = {"id": movie_id, "source": source}
    mongo.db.favorites.update_one(
        {"username": current_user["username"]},
        {"$addToSet": {"movies": movie_obj}},
        upsert=True
    )
    return jsonify({"success": True, "message": "Đã thêm vào yêu thích!"})

@app.route('/api/favorite', methods=['GET'])
@token_required
def get_favorite(current_user):
    fav = mongo.db.favorites.find_one({"username": current_user["username"]}) or {}
    movies = fav.get("movies", [])
    results = []
    for m in movies:
        if isinstance(m, dict) and "id" in m and "source" in m:
            results.append({"id": m["id"], "source": m["source"]})
        elif isinstance(m, str):  # tương thích dữ liệu cũ
            results.append({"id": m, "source": "local"})
    return jsonify({"success": True, "movies": results})

@app.route('/api/favorite', methods=['DELETE'])
@token_required
def remove_favorite(current_user):
    movie_id = str(request.json.get("movie_id"))
    source = request.json.get("source", "local")
    # Xoá đúng id & source
    mongo.db.favorites.update_one(
        {"username": current_user["username"]},
        {"$pull": {"movies": {"id": movie_id, "source": source}}}
    )
    return jsonify({"success": True, "message": "Đã xóa khỏi yêu thích!"})


@app.route('/api/watchlater', methods=['POST'])
@token_required
def add_watch_later(current_user):
    movie_id = str(request.json.get("movie_id"))
    source = request.json.get("source", "local")
    if not movie_id or not source:
        return jsonify({"success": False, "message": "Thiếu movie_id hoặc source!"}), 400
    movie_obj = {"id": movie_id, "source": source}
    mongo.db.watchlater.update_one(
        {"username": current_user["username"]},
        {"$addToSet": {"movies": movie_obj}},
        upsert=True
    )
    return jsonify({"success": True, "message": "Đã thêm vào danh sách xem sau!"})

@app.route('/api/watchlater', methods=['GET'])
@token_required
def get_watch_later(current_user):
    wl = mongo.db.watchlater.find_one({"username": current_user["username"]}) or {}
    movies = wl.get("movies", [])
    results = []
    for m in movies:
        if isinstance(m, dict) and "id" in m and "source" in m:
            results.append({"id": m["id"], "source": m["source"]})
        elif isinstance(m, str):
            results.append({"id": m, "source": "local"})
    return jsonify({"success": True, "movies": results})

@app.route('/api/watchlater', methods=['DELETE'])
@token_required
def remove_watch_later(current_user):
    movie_id = str(request.json.get("movie_id"))
    source = request.json.get("source", "local")
    mongo.db.watchlater.update_one(
        {"username": current_user["username"]},
        {"$pull": {"movies": {"id": movie_id, "source": source}}}
    )
    return jsonify({"success": True, "message": "Đã xóa khỏi danh sách xem sau!"})




# ----------- Serve static files (poster, video, trailer) -----------
@app.route('/uploads/posters/<filename>')
def serve_poster(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER_POSTER'], filename)

@app.route('/uploads/videos/<filename>')
def serve_video(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER_VIDEO'], filename)

@app.route('/uploads/trailers/<filename>')
def serve_trailer(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER_TRAILER'], filename)

# ---------- TMDb API PROXY ROUTES ----------

TMDB_API_KEY = "beede3bb5fc88310916252b96f99062a"
TMDB_BASE_URL = "https://api.themoviedb.org/3"

def tmdb_request(endpoint, params=None):
    url = f"{TMDB_BASE_URL}{endpoint}"
    if params is None:
        params = {}
    params["api_key"] = TMDB_API_KEY
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        return data, response.status_code
    except Exception as e:
        print("TMDb Proxy error:", e)
        return {"error": "TMDb proxy failed", "detail": str(e)}, 500

@app.route("/api/tmdb/genres", methods=["GET"])
def tmdb_genres():
    data, status = tmdb_request("/genre/movie/list", {"language": "vi-VN"})
    return jsonify(data), status

@app.route("/api/tmdb/popular", methods=["GET"])
def tmdb_popular():
    data, status = tmdb_request("/movie/popular", {"language": "vi-VN", "page": request.args.get("page", 1)})
    return jsonify(data), status

@app.route("/api/tmdb/top-rated", methods=["GET"])
def tmdb_top_rated():
    data, status = tmdb_request("/movie/top_rated", {"language": "vi-VN"})
    return jsonify(data), status

@app.route("/api/tmdb/movie/<movie_id>", methods=["GET"])
def tmdb_movie_detail(movie_id):
    data, status = tmdb_request(f"/movie/{movie_id}", {"language": "vi-VN"})
    return jsonify(data), status

@app.route("/api/tmdb/movie/<movie_id>/videos", methods=["GET"])
def tmdb_movie_videos(movie_id):
    data, status = tmdb_request(f"/movie/{movie_id}/videos")
    return jsonify(data), status

@app.route("/api/tmdb/discover", methods=["GET"])
def tmdb_discover():
    from datetime import datetime
    TOTAL_PAGES = 20
    page = int(request.args.get("page", 1))
    if page > TOTAL_PAGES:
        page = TOTAL_PAGES

    raw_params = {
        "page": page,
        "release_date.lte": datetime.today().strftime("%Y-%m-%d"),
        "with_genres": request.args.get("with_genres"),
        "region": request.args.get("region"),
        "with_origin_country": request.args.get("with_origin_country"),
        "with_original_language": request.args.get("with_original_language"),
        "primary_release_year": request.args.get("primary_release_year"),
        "certification": request.args.get("certification"),
        "certification_country": request.args.get("certification_country"),
        "sort_by": request.args.get("sort_by")
    }

    params = {k: v for k, v in raw_params.items() if v not in [None, "", "all"]}

    if "sort_by" not in params:
        params["sort_by"] = "popularity.desc"

    data, status = tmdb_request("/discover/movie", params)
    if status == 200 and "total_pages" in data:
        data["total_pages"] = min(data["total_pages"], TOTAL_PAGES)
    return jsonify(data), status

@app.route("/api/tmdb/search", methods=["GET"])
def tmdb_search():
    query = request.args.get("query")
    if not query:
        return jsonify({"error": "Missing query param"}), 400
    data, status = tmdb_request("/search/movie", {"query": query, "language": "vi-VN"})
    return jsonify(data), status

@app.route("/api/actors/popular", methods=["GET"])
def get_popular_actors():
    page = request.args.get("page", 1)
    raw, status = tmdb_request("/person/popular", {"language": "vi-VN", "page": page})
    if status != 200:
        return jsonify({"error": "TMDB error"}), status

    actors = [
        {
            "id": p["id"],
            "name": p["name"],
            "avatar": f'https://image.tmdb.org/t/p/w500{p["profile_path"]}' if p["profile_path"] else "/images/no-avatar.jpg"
        }
        for p in raw.get("results", [])
    ]
    return jsonify(actors)

# -------- 2. Lấy danh sách tất cả diễn viên (gộp nhiều page, trả tối đa N diễn viên) --------
@app.route("/api/actors", methods=["GET"])
def get_all_actors():
    # TMDB không có endpoint \"all person\", nên ta gộp nhiều trang popular lại
    pages = int(request.args.get("pages", 3))  # số page muốn lấy, mặc định 3
    all_actors = []
    for page in range(1, pages + 1):
        raw, status = tmdb_request("/person/popular", {"language": "vi-VN", "page": page})
        if status != 200:
            continue
        all_actors += [
            {
                "id": p["id"],
                "name": p["name"],
                "avatar": f'https://image.tmdb.org/t/p/w500{p["profile_path"]}' if p["profile_path"] else "/images/no-avatar.jpg"
            }
            for p in raw.get("results", [])
        ]
    # Loại bỏ diễn viên trùng (theo id)
    seen, unique_actors = set(), []
    for a in all_actors:
        if a["id"] not in seen:
            unique_actors.append(a)
            seen.add(a["id"])
    return jsonify(unique_actors)


@app.route("/api/actors/<int:actor_id>", methods=["GET"])
def actor_detail(actor_id):
    person, st1 = tmdb_request(f"/person/{actor_id}", {"language": "vi-VN"})
    if st1 != 200:
        return jsonify({"error": "Not found"}), st1

    credits, st2 = tmdb_request(f"/person/{actor_id}/movie_credits", {"language": "vi-VN"})
    movies = [
        {
            "id": m["id"],
            "title": m["title"],
            "aliasTitle": m.get("original_title"),
            "poster": f'https://image.tmdb.org/t/p/w500{m["poster_path"]}' if m["poster_path"] else "/images/no-poster.jpg",
            "year": int(m["release_date"][:4]) if m.get("release_date") else 0
        }
        for m in credits.get("cast", []) if st2 == 200
    ]

    detail = {
        "id": person["id"],
        "name": person["name"],
        "avatar": f'https://image.tmdb.org/t/p/w500{person["profile_path"]}' if person["profile_path"] else "/images/no-avatar.jpg",
        "gender": "Nữ" if person["gender"] == 1 else "Nam" if person["gender"] == 2 else "Khác",
        "biography": person.get("biography"),
        "born": person.get("birthday"),
        "altNames": ", ".join(person.get("also_known_as", [])[:4]),
        "movies": movies
    }

    return jsonify(detail)


@app.route("/api/tmdb/countries")
def fake_countries():
    return jsonify({
        "countries": [
            {"id": "VN", "name": "Việt Nam"},
            {"id": "KR", "name": "Hàn Quốc"},
            {"id": "US", "name": "Mỹ"},
            {"id": "JP", "name": "Nhật Bản"},
            {"id": "CN", "name": "Trung Quốc"},
            {"id": "IN", "name": "Ấn Độ"},
        ]
    })

@app.route("/api/tmdb/configuration/languages", methods=["GET"])
def tmdb_languages():
    data, status = tmdb_request("/configuration/languages")
    return jsonify(data), status

@app.route("/api/tmdb/configuration/countries", methods=["GET"])
def tmdb_countries():
    data, status = tmdb_request("/configuration/countries")
    return jsonify(data), status

@app.route("/api/tmdb/movie/<movie_id>/credits", methods=["GET"])
def tmdb_movie_credits(movie_id):
    data, status = tmdb_request(f"/movie/{movie_id}/credits")
    return jsonify(data), status

@app.route("/api/tmdb/movie/<movie_id>/similar", methods=["GET"])
def tmdb_movie_similar(movie_id):
    data, status = tmdb_request(f"/movie/{movie_id}/similar", {"language": "vi-VN"})
    return jsonify(data), status

@app.route("/api/tmdb/movie/<movie_id>/reviews", methods=["GET"])
def tmdb_movie_reviews(movie_id):
    data, status = tmdb_request(f"/movie/{movie_id}/reviews", {"language": "vi-VN"})
    return jsonify(data), status

@app.route("/api/tmdb/movie/<movie_id>/images", methods=["GET"])
def tmdb_movie_images(movie_id):
    data, status = tmdb_request(f"/movie/{movie_id}/images")
    return jsonify(data), status

@app.route("/api/tmdb/movie/<movie_id>/keywords", methods=["GET"])
def tmdb_movie_keywords(movie_id):
    data, status = tmdb_request(f"/movie/{movie_id}/keywords")
    return jsonify(data), status

@app.route("/api/tmdb/movie/<movie_id>/recommendations", methods=["GET"])
def tmdb_movie_recommendations(movie_id):
    data, status = tmdb_request(f"/movie/{movie_id}/recommendations", {"language": "vi-VN"})
    return jsonify(data), status

#----------------------REVIEW PHIM-----------------#
@app.route('/api/reviews/<movie_id>', methods=['GET'])
def get_reviews(movie_id):
    reviews_cursor = mongo.db.reviews.find({"movie_id": movie_id}).sort("created_at", -1)
    reviews = []
    for r in reviews_cursor:
        reviews.append({
            "id": str(r.get("_id")),
            "user_id": r.get("user_id"),
            "username": r.get("username", "Ẩn danh"),
            "rating": r.get("rating"),
            "comment": r.get("comment"),
            "created_at": r.get("created_at").isoformat() if r.get("created_at") else None,
        })
    return jsonify({"success": True, "reviews": reviews})

@app.route('/api/reviews/<movie_id>/summary', methods=['GET'])
def get_review_summary(movie_id):
    pipeline = [
        {"$match": {"movie_id": movie_id}},
        {
            "$group": {
                "_id": "$movie_id",
                "avgRating": {"$avg": "$rating"},
                "count": {"$sum": 1}
            }
        }
    ]
    summary = list(mongo.db.reviews.aggregate(pipeline))
    if summary:
        data = {
            "avgRating": round(summary[0]["avgRating"], 1),
            "count": summary[0]["count"]
        }
    else:
        data = {"avgRating": 0, "count": 0}
    return jsonify(data)

@app.route('/api/reviews', methods=['POST'])
@token_required
def add_review(current_user):
    data = request.json
    movie_id = data.get("movie_id")
    rating = data.get("rating")
    comment = data.get("comment", "")

    if not movie_id or rating is None:
        return jsonify({"success": False, "message": "Thiếu movie_id hoặc rating"}), 400

    try:
        rating = float(rating)
        if rating < 0 or rating > 5:
            return jsonify({"success": False, "message": "Rating phải từ 0 đến 5"}), 400
    except:
        return jsonify({"success": False, "message": "Rating không hợp lệ"}), 400

    review_doc = {
        "movie_id": movie_id,
        "user_id": current_user.get("username"),
        "username": current_user.get("displayName", current_user.get("username", "Ẩn danh")),
        "rating": rating,
        "comment": comment,
        "created_at": datetime.utcnow()
    }

    mongo.db.reviews.insert_one(review_doc)

    return jsonify({"success": True, "message": "Đã thêm đánh giá!"})


# ---------- ADMIN USERS ----------

@app.route('/api/users', methods=['GET'])
@token_required
@admin_required
def get_users(current_user):
    users = []
    for u in mongo.db.users.find({}, {"password": 0}):
        u["_id"] = str(u["_id"])
        users.append(u)
    return jsonify({"success": True, "users": users})

@app.route('/api/users/<username>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(username, current_user):
    if username == current_user["username"]:
        return jsonify({"success": False, "message": "Không thể xoá chính bạn!"}), 400
    result = mongo.db.users.delete_one({"username": username})
    if result.deleted_count == 1:
        return jsonify({"success": True, "message": "Đã xoá user!"})
    else:
        return jsonify({"success": False, "message": "User không tồn tại!"}), 404

@app.route('/api/users/<username>', methods=['PATCH'])
@token_required
@admin_required
def update_user(username, current_user):
    data = request.json
    update_fields = {}
    for field in ["displayName", "avatar", "gender", "role", "email"]:
        if field in data:
            update_fields[field] = data[field]
    if update_fields:
        result = mongo.db.users.update_one({"username": username}, {"$set": update_fields})
        if result.matched_count:
            return jsonify({"success": True, "message": "Đã cập nhật user!"})
    return jsonify({"success": False, "message": "User không tồn tại!"}), 404


# ---------- CATEGORY ADMIN (CRUD) ----------
@app.route('/api/categories', methods=['GET'])
def get_categories():
    cats = []
    for c in mongo.db.categories.find():
        c['_id'] = str(c['_id'])
        cats.append({'id': c['_id'], 'name': c.get('name')})
    return jsonify({'success': True, 'categories': cats})

@app.route('/api/categories', methods=['POST'])
@token_required
@admin_required
def add_category(current_user):
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({'success': False, 'message': 'Thiếu tên thể loại!'}), 400
    if mongo.db.categories.find_one({'name': name}):
        return jsonify({'success': False, 'message': 'Tên thể loại đã tồn tại!'}), 400
    mongo.db.categories.insert_one({'name': name})
    return jsonify({'success': True, 'message': 'Đã thêm thể loại!'})

@app.route('/api/categories/<cat_id>', methods=['PUT'])
@token_required
@admin_required
def edit_category(cat_id, current_user):
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({'success': False, 'message': 'Thiếu tên thể loại!'}), 400
    from bson import ObjectId
    result = mongo.db.categories.update_one({'_id': ObjectId(cat_id)}, {'$set': {'name': name}})
    if result.matched_count:
        return jsonify({'success': True, 'message': 'Đã cập nhật!'})
    return jsonify({'success': False, 'message': 'Không tìm thấy thể loại!'}), 404

@app.route('/api/categories/<cat_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_category(cat_id, current_user):
    from bson import ObjectId
    result = mongo.db.categories.delete_one({'_id': ObjectId(cat_id)})
    if result.deleted_count:
        return jsonify({'success': True, 'message': 'Đã xoá thể loại!'})
    return jsonify({'success': False, 'message': 'Không tìm thấy thể loại!'}), 404

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.environ.get("SMTP_USER")  # đặt trong biến môi trường
SMTP_PASS = os.environ.get("SMTP_PASS")

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

@app.route('/api/request-otp', methods=['POST'])
def request_otp():
    data = request.json
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Thiếu email'}), 400

    user = mongo.db.users.find_one({'email': email})
    if not user:
        return jsonify({'error': 'Email không tồn tại'}), 400

    otp_code = generate_otp()
    expired_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)

    # Lưu vào collection otp, nếu đã có thì cập nhật
    mongo.db.password_otps.update_one(
        {'email': email},
        {'$set': {'otp': otp_code, 'expired_at': expired_at}},
        upsert=True
    )

    # Gửi mail OTP (bạn dùng code gửi mail như trên, sửa body)
    subject = "Mã xác thực đổi mật khẩu"
    body = f"Mã xác thực (OTP) của bạn là: {otp_code}\nHiệu lực trong 5 phút."
    send_reset_email(email, subject, body)  # Tái sử dụng hàm send_reset_email

    return jsonify({'message': 'Đã gửi mã xác thực về email'}), 200

@app.route('/api/verify-otp-reset', methods=['POST'])
def verify_otp_reset():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')
    if not all([email, otp, new_password]):
        return jsonify({'error': 'Thiếu thông tin'}), 400

    otp_record = mongo.db.password_otps.find_one({'email': email})
    if (not otp_record
        or otp_record['otp'] != otp
        or otp_record['expired_at'] < datetime.datetime.utcnow()):
        return jsonify({'error': 'Mã OTP không hợp lệ hoặc đã hết hạn'}), 400

    user = mongo.db.users.find_one({'email': email})
    if not user:
        return jsonify({'error': 'Email không tồn tại'}), 400

    hashed_pw = generate_password_hash(new_password)
    mongo.db.users.update_one({'email': email}, {'$set': {'password': hashed_pw}})

    # Xoá mã OTP sau khi dùng
    mongo.db.password_otps.delete_one({'email': email})

    return jsonify({'message': 'Đổi mật khẩu thành công'}), 200

# ---------- RUN APP ----------
if __name__ == '__main__':
    app.run(port=5000, debug=True)
