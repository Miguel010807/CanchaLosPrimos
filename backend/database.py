import psycop2
from psycop2.extras import RealDictCursor
from config import DATABASE_URL

def get_connection():
    return psycop2.connect(DATABASE_URL, cursos_factory=RealDictCursor)

