import urllib.parse
import sys

def generate_google_search_url(query):
    """
    Tạo một URL tìm kiếm Google có thể click được từ một truy vấn Dork.
    """
    base_url = "https://www.google.com/search?q="
    encoded_query = urllib.parse.quote(query)
    return base_url + encoded_query

def main():
    if len(sys.argv) < 2:
        print("Sử dụng: python generate_dork_links.py '<dork_query>'")
        print("Ví dụ: python generate_dork_links.py 'site:github.com ext:env \"DB_PASSWORD\"'")
        sys.exit(1)
    
    query = " ".join(sys.argv[1:])
    url = generate_google_search_url(query)
    
    print("\n[+] Truy vấn gốc: " + query)
    print("[+] Click vào liên kết dưới đây để tìm kiếm trên Google:\n")
    print(url + "\n")

if __name__ == "__main__":
    main()
