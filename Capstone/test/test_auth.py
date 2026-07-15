def test_register_user_returns_201(client):
    user_data = {
        "username": "alice",
        "password": "password123",
        "role": "user",
    }
    
    response = client.post(
        "/auth/",
        json=user_data
    )
    
    # print(response.status_code)
    # print(response.json())
    response_data = response.json()
    
    assert response.status_code == 201
    assert response_data["username"] == "alice"
    assert response_data["role"] == "user"
    assert "password" not in response_data
    assert "hashed_password" not in response_data
    
def test_login_with_correct_password_returns_token(client):
    register_response = client.post(
        "/auth/",
        json={
            "username": "alice",
            "password": "password123",
            "role": "user",
        },
    )
    
    assert register_response.status_code == 201
    
    response = client.post(
        "/auth/token",
        data={
            "username": "alice",
            "password": "password123",
        },
    )
    response_data = response.json()
    # print(response.status_code)
    # print(response.json())
    
    assert response.status_code == 200
    assert "access_token" in response_data
    assert isinstance(response_data["access_token"], str)
    assert len(response_data["access_token"]) > 0
    
def test_login_with_wrong_password_returns_401(client):
    register_response = client.post(
        "/auth/",
        json={
            "username": "alice",
            "password": "password123",
            "role": "user",
        },
    )
    
    assert register_response.status_code == 201
    
    response = client.post(
        "/auth/token",
        data={
            "username": "alice",
            "password": "cfvv",
        },
    )
    response_data = response.json()
    # print(response.status_code)
    # print(response.json())
    
    assert response.status_code == 401
