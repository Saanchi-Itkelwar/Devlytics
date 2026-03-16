import pytest

TEST_USER = {
    "full_name": "Test User",
    "email": "test@devlytics.dev",
    "password": "testpassword123",
    "confirm_password": "testpassword123",
}


def test_register(client):
    res = client.post("/api/auth/register", json=TEST_USER)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email(client):
    client.post("/api/auth/register", json=TEST_USER)
    res = client.post("/api/auth/register", json=TEST_USER)
    assert res.status_code == 400
    assert "already registered" in res.json()["detail"]


def test_login(client):
    client.post("/api/auth/register", json=TEST_USER)
    res = client.post("/api/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"],
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_wrong_password(client):
    client.post("/api/auth/register", json=TEST_USER)
    res = client.post("/api/auth/login", json={
        "email": TEST_USER["email"],
        "password": "wrongpassword",
    })
    assert res.status_code == 401


def test_me_authenticated(client):
    client.post("/api/auth/register", json=TEST_USER)
    login = client.post("/api/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"],
    })
    token = login.json()["access_token"]

    res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert res.json()["email"] == TEST_USER["email"]


def test_me_unauthenticated(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_passwords_must_match(client):
    res = client.post("/api/auth/register", json={
        **TEST_USER,
        "email": "mismatch@devlytics.dev",
        "confirm_password": "differentpassword",
    })
    assert res.status_code == 422
