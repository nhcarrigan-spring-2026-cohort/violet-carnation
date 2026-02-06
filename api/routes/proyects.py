#
# Get projects endpoint
#

""" @app.get("/projects/")
async def read_projects(
    session: SessionDep,
    offset: int=0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Projects]:
    projects = session.exec( select(Projects).offset(offset).limit(limit)).all()
    return projects 
 """