def get_token(client):
    client.post("/api/auth/register", json={
        "full_name": "Sync User",
        "email": "sync@devlytics.dev",
        "password": "syncpassword123",
        "confirm_password": "syncpassword123",
    })
    res = client.post("/api/auth/login", json={
        "email": "sync@devlytics.dev",
        "password": "syncpassword123",
    })
    return res.json()["access_token"]


def test_sync_status_initial(client):
    token = get_token(client)
    res = client.get(
        "/api/sync/status",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["is_syncing"] == False
    assert data["github_synced"] == False


def test_sync_status_unauthenticated(client):
    res = client.get("/api/sync/status")
    assert res.status_code == 401
