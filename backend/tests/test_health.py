def test_root(client):
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["message"] == "Devlytics API is running"


def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
