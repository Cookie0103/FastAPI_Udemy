def test_create_request_without_login_returns_401(client):
    response = client.post(
        "/requests/",
        json={
            "title": "Cannot access  billings",
            "description": "The user gets a 403 after login",
            "category": "bug",
            "priority": "high",
        },
    )
    
    assert response.status_code == 401

def test_create_request_after_login_returns_201(client):
    client.post(
        "/auth/",
        json={
            "username": "alice",
            "password": "password123",
            "role": "user",
        },
    )
    
    login_response = client.post(
        "/auth/token",
        data={
            "username": "alice",
            "password": "password123",
        },
    )
    
    token = login_response.json()["access_token"]
    
    response = client.post(
        "/requests/",
        json={
            "title": "Cannot access  billings",
            "description": "The user gets a 403 after login",
            "category": "bug",
            "priority": "high",
        },
        headers={
            "Authorization": f"Bearer {token}"
        },
    )
    
    assert response.status_code == 201
    
def test_create_request_missing_field_returns_422(client):
    client.post(
        "/auth/",
        json={
            "username": "alice",
            "password": "password123",
            "role": "user",
        },
    )
    
    login_response = client.post(
        "/auth/token",
        data={
            "username": "alice",
            "password": "password123",
        },
    )
    
    token = login_response.json()["access_token"]
    
    response = client.post(
        "/requests/",
        json={
            "description": "The user gets a 403 after login",
            "category": "bug",
            "priority": "high",
        },
        headers={
            "Authorization": f"Bearer {token}"
        },
    )
    
    assert response.status_code == 422
    
def test_create_request_invalid_priority_returns_422(client):
    client.post(
        "/auth/",
        json={
            "username": "Alice",
            "password": "password123",
            "role": "user"
        }
    )
    
    response_login = client.post(
        "/auth/token/",
        data={
            "username": "Alice",
            "password": "password123",
        }
    )
    
    token = response_login.json()["access_token"]
    
    response = client.post(
        "/requests/",
        json={
            "title": "Cannot access  billings",
            "description": "The user gets a 403 after login",
            "category": "bug",
            "priority": "urgenbt",
        },
        headers = {
            "Authorization": f"Bearer {token}"
        }
    )
    
    assert response.status_code == 422

def test_user_a_cannot_read_user_b_request_returns_404(client):
    client.post(
        "/auth/",
        json={
            "username": "User_a",
            "password": "password1",
            "role": "user"
        }
    )
    client.post(
        "/auth/",
        json={
            "username": "User_b",
            "password": "password2",
            "role": "user"
        }
    )
    
    response_login_a = client.post(
        "/auth/token/",
        data={
            "username": "User_a",
            "password": "password1",
        }
    )
    response_login_b = client.post(
        "/auth/token/",
        data={
            "username": "User_b",
            "password": "password2",
        }
    )
    token_a = response_login_a.json()["access_token"]
    token_b = response_login_b.json()["access_token"]
    
    response_b = client.post(
        "/requests/",
        json={
            "title": "Cannot access  billings",
            "description": "The user gets a 403 after login",
            "category": "bug",
            "priority": "high",
        },
        headers = {
            "Authorization": f"Bearer {token_b}"
        }
    )
    request_id_b = response_b.json()["id"]
    
    response_a = client.get(
        f"/requests/{request_id_b}",
        headers = {
            "Authorization": f"Bearer {token_a}"
        }
    )
    
    assert response_a.status_code == 404
    
    
def test_user_a_cannot_update_user_b_request_returns_404(client):
    client.post(
        "/auth/",
        json={
            "username": "User_a",
            "password": "password1",
            "role": "user"
        }
    )
    client.post(
        "/auth/",
        json={
            "username": "User_b",
            "password": "password2",
            "role": "user"
        }
    )
    
    response_login_a = client.post(
        "/auth/token/",
        data={
            "username": "User_a",
            "password": "password1",
        }
    )
    response_login_b = client.post(
        "/auth/token/",
        data={
            "username": "User_b",
            "password": "password2",
        }
    )
    token_a = response_login_a.json()["access_token"]
    token_b = response_login_b.json()["access_token"]
    
    response_b = client.post(
        "/requests/",
        json={
            "title": "Cannot access  billings",
            "description": "The user gets a 403 after login",
            "category": "bug",
            "priority": "high",
        },
        headers = {
            "Authorization": f"Bearer {token_b}"
        }
    )
    assert response_b.status_code == 201
    
    request_id_b = response_b.json()["id"]
    
    response_a = client.put(
        f"/requests/{request_id_b}",
        json={
            "title": "Test test test",
            "category": "bug",
            "priority": "low",
        },
        headers = {
            "Authorization": f"Bearer {token_a}"
        }
    )
    
    assert response_a.status_code == 404
    
    
    