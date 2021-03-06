import { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

// components
import PokemonThumbnail from "../../components/pokemon-thumbnail/pokemon-thumbnail.component.jsx";
import PokemonType from "../../components/pokemon-type/pokemon-type.component";
import Loading from "../../components/loading/loading.component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import "./pokemon-detail.styles.css";
import { useFormik } from "formik";

// Local storage
import { setPokemon, getPokemon } from "../../local-storage";
// import PokemonContext from "../../context/pokemon-context";

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "@emotion/react";
import { pokemonTypeSeparator, pokemonMove, pokemonName, cursorPointer } from "./pokemon-detail.styles";

const GET_POKEMON_DETAIL = gql`
  query PokemonDetail($pokemonName: String!) {
    pokemon(name: $pokemonName) {
      id
      moves {
        move {
          name
        }
      }
      types {
        type {
          name
        }
      }
      height
      weight
      base_experience
      sprites {
        front_default
        front_shiny
        back_default
        back_shiny
      }
      message
    }
  }
`;

const PokemonDetail = props => {
  // const pokemonContext = useContext(PokemonContext);
  const [thumbnail, setThumbnail] = useState("");
  const [showNickname, setShowNickname] = useState(false);

  const notification = isFailed => {
    if (isFailed) {
      toast.error("The pokemon escaped. Please try again.");
    } else {
      toast.success("You successfully catch the pokemon. Give him a nickname!");
    }
  };

  const { data, loading } = useQuery(GET_POKEMON_DETAIL, {
    variables: { pokemonName: props.match.params.pokemonName },
    onCompleted: data => {
      setThumbnail(data.pokemon.sprites.front_default);
    },
  });

  const catchPokemon = () => {
    const randomNumber = Math.random();
    if (randomNumber >= 0.5) {
      setShowNickname(true);
      notification(false);
    } else {
      notification(true);
    }
  };

  const handleOnSubmit = value => {
    let pokemonValue = {
      pokemonNickname: value.pokemonName,
      pokemonImage: data.pokemon.sprites.front_default,
      pokemonName: props.match.params.pokemonName,
      pokemonId: Math.floor(Math.random() * 100000),
    };

    // // Retrieve
    // if (getPokemon()[data.pokemon.id] !== undefined) {
    //   pokemonValue = { ...getPokemon()[data.pokemon.id], pokemonNickname: value.pokemonName };
    // }
    props.history.replace("/");

    setPokemon(data.pokemon.id, pokemonValue);
  };

  const validate = values => {
    const errors = {};
    const getCurrentPokemon = getPokemon();
    if (!values.pokemonName) {
      errors.pokemonName = "Pokemon name is required";
    }

    // Validation for nickname
    for (const key in getCurrentPokemon) {
      for (const pokemon of getCurrentPokemon[key]) {
        if (pokemon.pokemonNickname === values.pokemonName) {
          errors.pokemonName = "You have already used this nickname. Use another nickname";
        }
      }
    }

    // getCurrentPokemon.forEach(({ pokemonNickname }) => {
    //   if (pokemonNickname === values.pokemonName) {
    //     errors.pokemonName = "You have already used this nickname. Use another nickname";
    //   }
    // });

    return errors;
  };

  const formik = useFormik({
    initialValues: { pokemonName: "" },
    validate,
    onSubmit: value => {
      handleOnSubmit(value);
    },
  });

  const savePokemon = () => {};

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="row mt-5">
        <div className="col-lg-4 col-md-12">
          <PokemonThumbnail
            thumbnailPicture={thumbnail}
            frontShiny={data.pokemon.sprites.front_shiny}
            backShiny={data.pokemon.sprites.back_shiny}
            backDefault={data.pokemon.sprites.back_default}
          />
          <div className="d-flex">
            <div
              css={cursorPointer}
              onClick={() => {
                setThumbnail(data.pokemon.sprites.back_default);
              }}
            >
              <img className="img-fluid" src={data.pokemon.sprites.back_default} alt="Pokemon Back" />
            </div>
            <div
              css={cursorPointer}
              onClick={() => {
                setThumbnail(data.pokemon.sprites.front_shiny);
              }}
            >
              <img className="img-fluid" src={data.pokemon.sprites.front_shiny} alt="Pokemon Front" />
            </div>

            <div
              css={cursorPointer}
              onClick={() => {
                setThumbnail(data.pokemon.sprites.back_shiny);
              }}
            >
              <img className="img-fluid" src={data.pokemon.sprites.back_shiny} alt="Pokemon Back Shiny" />
            </div>
          </div>
        </div>
        <div className="col-lg-8 col-md-12">
          <h3 css={pokemonName} className="mt-4">
            {props.match.params.pokemonName}
          </h3>
          <div className="mb-4">
            {data.pokemon.types.map(type => {
              return (
                <div css={pokemonTypeSeparator} key={type.type.name} className="d-inline">
                  <PokemonType typeName={type.type.name} />
                </div>
              );
            })}
          </div>
          <Tabs>
            <TabList>
              <Tab>Detail</Tab>
              <Tab>Move</Tab>
            </TabList>
            <TabPanel>
              <h4 className="mb-4">Pokemon Detail</h4>
              <h6>
                Base Experience: <p className="d-inline">{data.pokemon.base_experience}</p>
              </h6>
              <h6>
                Height: <p className="d-inline">{data.pokemon.height}</p>
              </h6>
              <h6>
                Weight: <p className="d-inline">{data.pokemon.weight}</p>
              </h6>
            </TabPanel>
            <TabPanel>
              <h4 className="mb-4">Moves</h4>
              <ul css={pokemonMove}>
                {data.pokemon.moves.map(move => {
                  return <li key={move.move.name}>{move.move.name}</li>;
                })}
              </ul>
            </TabPanel>
          </Tabs>

          {showNickname ? (
            <div className="w-50 mb-5">
              <form onSubmit={formik.handleSubmit}>
                <label htmlFor="pokemonNickname">Nickname</label>
                <input
                  type="text"
                  className={`form-control ${formik.errors.pokemonName && formik.touched.pokemonName && "is-invalid"} ${
                    !formik.errors.pokemonName && formik.touched.pokemonName && "is-valid"
                  } `}
                  id="pokemonName"
                  name="pokemonName"
                  placeholder="Enter your pokemon nickname"
                  onChange={formik.handleChange}
                  value={formik.values.pokemonName}
                  onBlur={formik.handleBlur}
                />
                <div className="invalid-feedback">{formik.errors.pokemonName}</div>
                <div className="valid-feedback">Looks good.</div>

                <button onClick={savePokemon} type="submit" className="btn btn-outline-success mt-2 mb-3">
                  Save Pokemon
                </button>
              </form>
            </div>
          ) : (
            <button onClick={catchPokemon} type="button" className="btn btn-outline-success mt-1 mb-3">
              Catch {props.match.params.pokemonName}
            </button>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default PokemonDetail;
