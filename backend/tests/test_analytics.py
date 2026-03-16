def get_token(client):
    client.post("/api/auth/register", json={
        "full_name": "Analytics User",
        "email": "analytics@devlytics.dev",
        "password": "analyticspassword123",
        "confirm_password": "analyticspassword123",
    })
    res = client.post("/api/auth/login", json={
        "email": "analytics@devlytics.dev",
        "password": "analyticspassword123",
    })
    return res.json()["access_token"]


def test_overview_empty(client):
    token = get_token(client)
    res = client.get(
        "/api/analytics/overview",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_commits"] == 0
    assert data["active_repos"] == 0
    assert data["prs_merged"] == 0
    assert data["issues_resolved"] == 0
    assert data["coding_streak"] == 0


def test_heatmap_empty(client):
    token = get_token(client)
    res = client.get(
        "/api/analytics/heatmap",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_languages_empty(client):
    token = get_token(client)
    res = client.get(
        "/api/analytics/languages",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_coding_time_empty(client):
    token = get_token(client)
    res = client.get(
        "/api/analytics/coding-time",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 24  # All 24 hours returned


def test_commit_frequency_ranges(client):
    token = get_token(client)
    for range_val in ["week", "month", "year"]:
        res = client.get(
            f"/api/analytics/commit-frequency?range={range_val}",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200


def test_analytics_unauthenticated(client):
    for endpoint in ["/api/analytics/overview", "/api/analytics/heatmap"]:
        res = client.get(endpoint)
        assert res.status_code == 401


def test_repos_empty(client):
    token = get_token(client)
    res = client.get(
        "/api/repos/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_repo_not_found(client):
    token = get_token(client)
    res = client.get(
        "/api/repos/99999",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 404
