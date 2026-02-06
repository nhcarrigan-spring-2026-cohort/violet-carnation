#
# Get Roles endpoint
#

""" @app.get("/roles/")
async def read_roles(
    session: SessionDep,
    offset: int=0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Roles]:
    roles = session.exec( select(Roles).offset(offset).limit(limit)).all()
    return roles
 """