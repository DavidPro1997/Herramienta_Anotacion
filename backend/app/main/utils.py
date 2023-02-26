from app.main import db


def commit_db():
    try:
        db.session.commit()
    except:
        # if any kind of exception occurs, rollback transaction
        db.session.rollback()
        raise
    


def eliminar_entidades(objs):
    db.session.delete(objs)
    commit_db()

def guardar_cambios(data):
    db.session.add(data)
    commit_db()
