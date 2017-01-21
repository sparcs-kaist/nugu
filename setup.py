from setuptools import setup
from pathlib import Path
import re

here = Path(__file__).resolve().parent


def _get_version():
    root_src = (here / 'nugu' / '__init__.py').read_text()
    try:
        version = re.findall(r"^__version__ = '([^']+)'\r?$", root_src, re.M)[0]
    except IndexError:
        raise RuntimeError('Unable to determine myself version.')
    return version


setup(
    name='nugu',

    # Versions should comply with PEP440.  For a discussion on single-sourcing
    # the version across setup.py and the project code, see
    # https://packaging.python.org/en/latest/single_source_version.html
    version=_get_version(),
    description='Nugu',
    long_description='SPARCS Address Book',
    url='https://github.com/sparcs-kaist/nugu',
    author='SPARCS Wheel',
    author_email='samjo@sparcs.org',
    license='',
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.5',
        'Operating System :: POSIX',
        'Operating System :: MacOS :: MacOS X',
        'Environment :: No Input/Output (Daemon)',
        'Topic :: Software Development',
    ],

    packages=['nugu'],

    python_requires='>=3.5.2',
    install_requires=[
        'pep8==1.7.0',
        'requests==2.11.1',
        'slacker==0.9.28',
        'SQLAlchemy==1.1.2',
        'websockets==3.2',
        'yarl==0.8.1',
        'mysqlclient==1.3.9',
    ],
    extras_require={
        'dev': ['pytest', 'flake8', 'pep8-naming'],
        'test': ['pytest'],
    },
    package_data={
    },
    data_files=[],
)
