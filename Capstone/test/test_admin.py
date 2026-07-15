def test_user_read_admin_requests(client):
    client.post(
        "/auth/",
        json={
            "username": "User_a",
            "password": "password1",
            "role": "user"
        }
    )
    
    response_login = client.post(
        "/auth/token/",
        data={
            "username": "User_a",
            "password": "password1",
        }
    )
    
    token = response_login.json()["access_token"]
    
    response = client.get(
        "/admin/requests",
        headers = {
            "Authorization": f"Bearer {token}"
        }
    )
    
    assert response.status_code == 403

def test_admin_read_admin_requests(client):
    client.post(
        "/auth/",
        json={
            "username": "User_a",
            "password": "password1",
            "role": "admin"
        }
    )
    
    response_login = client.post(
        "/auth/token/",
        data={
            "username": "User_a",
            "password": "password1",
        }
    )
    
    token = response_login.json()["access_token"]
    
    response = client.get(
        "/admin/requests",
        headers = {
            "Authorization": f"Bearer {token}"
        }
    )
    
    assert response.status_code == 200